# Use an official Python runtime as a parent image
FROM python:slim
ENV DOCKER=1 
RUN pip3 install eisenradio==1.2
RUN mkdir -p /eisenradio
CMD ["python3","-m","eisenradio.app"]

LABEL maintainer="rene_horn@gmx.net"
LABEL license=MIT
LABEL version="2.2.3"

LABEL description="								\
Browser autostart disable:							\
#ENV DOCKER=1									\
make the internal folder:							\
#RUN mkdir -p /eisenradio							\
build Eisenradio:								\
#sudo docker build -t 44xtc44/eisenradio .  					\
start Eisenradio:								\
#sudo docker run -v $(pwd):/eisenradio -it --network host 44xtc44/eisenradio	\
this will connect /eisenradio internal folder with pwd (your current) folder	\
in Browser use Save path:    /eisenradio/downloads				\
enjoy"
