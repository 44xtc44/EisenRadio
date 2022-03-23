import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

# ###############################################

pack_name = "eisenradio"
pack_version = "1.2"
pack_description = "Play radio. Style your App."

INSTALL_REQUIRES = [
    'flask_cors',
    'configparser~=5.2.0',
    'requests~=2.26.0',
    'urllib3~=1.26.7',
    'waitress~=2.0.0',
    'certifi~=2021.10.8',
    'python-dotenv~=0.19.2',
    'setuptools~=59.2.0',
    'Flask~=2.0.2',
    'click~=8.0.3',
    'Werkzeug~=2.0.2',
    'pytest~=6.2.5'
]
PYTHON_REQUIRES = '>=3.6'

setuptools.setup(

    name=pack_name,  # project name /folder
    version=pack_version,
    author="René Horn",
    author_email="rene_horn@gmx.net",
    description=pack_description,
    long_description=long_description,
    license='MIT License',
    long_description_content_type="text/markdown",
    url="",
    include_package_data=True,
    packages=setuptools.find_packages(),
    install_requires=INSTALL_REQUIRES,
    classifiers=[
        # How mature is this project? Common values are
        # https://packaging.python.org/guides/distributing-packages-using-setuptools/
        #   3 - Alpha
        #   4 - Beta
        #   5 - Production/Stable
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 5 - Production/Stable",
        "Topic :: Multimedia :: Sound/Audio :: Capture/Recording",
    ],
    python_requires=PYTHON_REQUIRES,
)
