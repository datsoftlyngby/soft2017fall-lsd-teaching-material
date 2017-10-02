FROM mongo:latest

ADD db_setup.js /db_setup.js
COPY db_setup.js /docker-entrypoint-initdb.d/
# ENTRYPOINT mongo db_setup.js
