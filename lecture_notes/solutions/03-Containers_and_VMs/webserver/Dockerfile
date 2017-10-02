FROM golang:jessie

# Install any needed packages specified in requirements.txt
RUN go get gopkg.in/mgo.v2

# Set the working directory to /app
WORKDIR /src

# Copy the current directory contents into the container at /app
COPY telbook_server.go /src/telbook_server.go

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.py when the container launches
RUN go build /src/telbook_server.go
ENTRYPOINT ./telbook_server
