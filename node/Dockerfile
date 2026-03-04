FROM  node:latest

WORKDIR   /app

COPY      package.json .

RUN       npm install

COPY . . 
#  This exposes used as documentation for users to know which port the application is running on. It does not actually publish the port.
EXPOSE 3000   

CMD     ["node", "server.js"]
