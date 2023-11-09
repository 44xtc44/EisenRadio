import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="ghettorecorder", # project name /folder
    version="2.3.1",
    author="René Horn",
    author_email="rene_horn@gmx.net",
    description="Play radio. Style your App.",
    long_description=long_description,
    license='MIT',
    long_description_content_type="text/markdown",
    url="https://github.com/pypa/sampleproject",
    include_package_data=True,
    packages=setuptools.find_packages(),
        install_requires=[
            'aacrepair~=0.4',
            'ghettorecorder==2.4.7',
            'flask>=2.3.2',
            'Werkzeug>=2.2.3',
            'certifi>=2022.12.07',
            'configparser~=5.0.2',
            'pytest~=6.2.5',
            'python-dotenv~=0.19.2',
            'waitress~=2.0.0',
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 5 - Production/Stable",
        "Topic :: Multimedia :: Sound/Audio :: Capture/Recording",
    ],
    python_requires=">=3.8",
)
