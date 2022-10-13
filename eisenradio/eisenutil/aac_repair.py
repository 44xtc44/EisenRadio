import os
import concurrent.futures
from eisenradio.api import ghettoApi
import eisenradio.lib.eisdb as eisen_db


class AacRepair:
    """write repaired aac or aac(plus) files from uploaded dictionary of files to disk, JS aac repair in Tools menu

    flask endpoint converts uploaded files from file storage type to bytestream .read() function
    {file(n).aac: b'\x65\x66\x67\x00\x10\x00\x00\x00\x04\x00'}
    detach repair cpu burden from main thread
    write log list to disk, have line breaks
    write log list to html, no line breaks
    calculate cut off bytes to show in the result
    """

    def __init__(self, file_dict):
        """"""
        self.file_dict = file_dict
        self.log_list = []
        self.file_size_dict = {}
        self.file_size_rep_dict = {}
        self.repaired_dict = {}
        self.error_dict = {}

    def repair_multi_files(self):
        """threaded file repair

        max_workers=1 a black box, more worker slowing down execution time on 100 files (4.2s to 4.8s)
        perhaps this is so unbelievable easy that imported foreign workers are hindering each other
        """
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            futures = [executor.submit(self.repair_one_file, name, content) for name, content in self.file_dict.items()]
            concurrent.futures.wait(futures)

        self.log_writer()
        return

    def repair_one_file(self, file_name, file_content):
        export_path = eisen_db.get_download_dir()
        tail_repaired = None

        file_path = os.path.join(export_path, file_name)
        head_repaired = self.tool_aacp_repair_head(file_name, file_content)
        if head_repaired is not None:
            tail_repaired = self.tool_aacp_repair_tail(file_name, head_repaired)
        if tail_repaired is not None:
            with open(file_path, 'wb') as binary_writer:
                binary_writer.write(tail_repaired)
            print(f'write file: {file_path}')
            self.repaired_dict[file_name] = file_name
        return True

    def tool_aacp_repair_head(self, f_name, chunk):
        """return bytes slice from shifted start to the end of chunk, except on error

        convert hex and make search string, cut and convert back to bytes
        """
        self.file_size_dict[f_name] = len(chunk)
        hex_chunk = chunk.hex()
        start, end = 0, 4
        search_string = "fff1"
        while 1:
            if end > len(hex_chunk):
                break
            if hex_chunk[start:end] == search_string:
                try:
                    return bytes.fromhex(hex_chunk[start:])
                except ValueError as error:
                    message = f'ValueError {error}'
                    self.error_dict[f_name] = message
                    return
                except Exception as error:
                    message = f'unknown error in tool_aacp_repair_head(), {error} ignore it.'
                    self.error_dict[f_name] = message
                    print(message)
                    return
            start += 1
            end += 1
        return

    def tool_aacp_repair_tail(self, f_name, chunk):
        """return bytes slice cut, except on error

        convert hex and make search string (reversed index), cut and convert back to bytes
        """
        hex_chunk = chunk.hex()
        start, end = -1, -5
        search_string = "fff1"
        while 1:
            if end < -(len(hex_chunk)):
                break
            if hex_chunk[end:start] == search_string:
                try:
                    self.file_size_rep_dict[f_name] = len(bytes.fromhex(hex_chunk[:end]))
                    return bytes.fromhex(hex_chunk[:end])
                except ValueError as error:
                    message = f'ValueError {error}'
                    self.error_dict[f_name] = message
                    # ValueError: non-hexadecimal number found in fromhex() arg at position 64805
                    return
                except Exception as error:
                    message = f'unknown error in tool_aacp_repair_tail(), {error} ignore it.'
                    self.error_dict[f_name] = message
                    print(message)
                    return
            start -= 1
            end -= 1
        return

    def log_writer(self):
        """write log to disk and ghettoApi"""
        export_path = eisen_db.get_download_dir()

        ok_list = list()
        for f_name, name in self.repaired_dict.items():
            message = f'{name}; cut(bytes): {self.byte_calc(f_name)}'
            ok_list.append(message)

        fail_msg = f'----- {str(len(self.error_dict))} file(s) failed -----'
        ok_msg = f'----- {str(len(self.repaired_dict))} file(s) repaired -----'
        file_path = os.path.join(export_path, 'eisenradio_aacp_repair.txt')
        with open(file_path, 'w') as text_writer:
            text_writer.write(fail_msg + '\n')
            [text_writer.write(f'{f_name} {err_msg}' + '\n') for f_name, err_msg in self.error_dict.items()]
            text_writer.write(ok_msg + '\n')
            [text_writer.write(f'{line}' + '\n') for line in ok_list]

        self.log_list.append(f'[ COPY(s) in {export_path} ]')
        self.log_list.append(fail_msg)
        self.log_list.extend([f'{f_name} {err_msg}' for f_name, err_msg in self.error_dict.items()])
        self.log_list.append(ok_msg)
        self.log_list.extend(ok_list)

        ghettoApi.aac_repair_log.clear()
        ghettoApi.aac_repair_log = self.log_list

    def byte_calc(self, f_name):
        """return cut off bytes, suspect to fail if ValueError hits"""
        try:
            size = self.file_size_dict[f_name] - self.file_size_rep_dict[f_name]
        except Exception as error:
            message = f'error in byte_calc {error}'
            return message
        return f'[{size}]'
