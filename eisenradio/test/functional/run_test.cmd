SET scriptpath=%~dp0
echo %scriptpath:~0,-1%

cd /d %scriptpath:~0,-1%

pip install pytest
pytest -v




pause