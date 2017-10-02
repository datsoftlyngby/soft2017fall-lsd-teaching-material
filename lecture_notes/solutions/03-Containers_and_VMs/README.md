We have a small application, a telephone book application. It consists of a [webserver](webserver/telbook_server.go) written in Go, which finds all `Person` records stored in a MongoDB [database](dbserver/db_setup.js) and returns an HTML page with those records.


# An example with Vagrant

See the [Vagrantfile](Vagrantfile) and start it with `vagrant up`. It will create two VMs. one with the [webserver](main.go) and the other one with the [database](db_setup.js).

# An example with Docker

## Building the DB Server
The following is written from my perspective, i.e. user `helgecph`.

```bash
cd dbserver/
docker build -t helgecph/dbserver .
```

## Building the Webserver

```bash
cd webserver/
docker build -t helgecph/webserver .
```

Now, check that both images are locally available.

```bash
$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
webserver           latest              5520fac0a523        24 seconds ago      718MB
dbserver            latest              f5567a451a4a        2 minutes ago       359MB
```

## Starting the Application Manually

On MacOS, MongoDB has an issue, see the *WARNING* on https://hub.docker.com/_/mongo/. Consequently, we mount the database to from a directory on the host.

```bash
$ mkdir $(pwd)/datadb
$ docker run -d -p 27017:27017 -v $(pwd)/datadb/:/data/db --name dbserver helgecph/dbserver
$ docker run -it -d --rm --name webserver --link dbserver -p 8080:8080 helgecph/webserver
```

Eventhough deprecated, we `--link` the containers via the bridge network together.

```bash
$ docker ps -a
CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS              PORTS                      NAMES
0282fc8b2c41        helgecph/webserver   "/bin/sh -c ./telb..."   11 seconds ago      Up 10 seconds       0.0.0.0:8080->8080/tcp     webserver
06b85924f444        helgecph/dbserver    "docker-entrypoint..."   6 minutes ago       Up 6 minutes        0.0.0.0:27017->27017/tcp   dbserver
```

### Testing the Application

```bash
$ docker run --rm --link webserver appropriate/curl:latest curl http://webserver:8080
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0<!DOCTYPE HTML>
<html>
    <head>
        <title>The Møllers</title>
    </head>
    <body>
        <h1>Telephone Book</h1>
        <hr>
        <table style="width:50%">
          <tr>
            <th>Index</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>City</th>
          </tr>

          <tr>
            <td>0</td>
            <td>Møller</td>
            <td>&#43;45 20 86 46 44</td>
            <td>Herningvej 8</td>
            <td>4800 Nykøbing F</td>
          </tr>

          <tr>
            <td>1</td>
            <td>A Egelund-Møller</td>
            <td>&#43;45 54 94 41 81</td>
            <td>Rønnebærparken 1 0011</td>
            <td>4983 Dannemare</td>
          </tr>

          <tr>
            <td>2</td>
            <td>A K Møller</td>
            <td>&#43;45 75 50 75 14</td>
            <td>Bregnerødvej 75, st. 0002</td>
            <td>3460 Birkerød</td>
          </tr>

          <tr>
            <td>3</td>
            <td>A Møller</td>
            <td>&#43;45 97 95 20 01</td>
            <td>Dalstræde 11 Heltborg</td>
            <td>7760 Hurup Thy</td>
          </tr>

        </table>
        <p></p>
        Data taken from <a href="https://www.krak.dk/person/resultat/møller">Krak.dk</a>
    </body>
</html>
100  1366  100  1366    0     0   443k      0 --:--:-- --:--:-- --:--:--  666k
```


## Stopping the Application Manually


```bash
docker stop dbserver
docker stop webserver
```

```bash
docker rm webserver
docker rm -v dbserver
```

## Starting the Application with Docker Compose


```yml
dbserver:
  image: helgecph/dbserver
  volumes:
    - ~/Documents/Lectures/soft2017fall/LSD/solutions/03-Containers\ and\ VMs/datadb/:/data/db
  ports:
    - "27017:27017"

webserver:
  image: helgecph/webserver
  ports:
    - "8080:8080"
  links:
      - dbserver

clidownload:
  image: appropriate/curl
  links:
    - webserver
  entrypoint: sh -c  "sleep 5 && curl http://webserver:8080"
```


```bash
$ docker-compose up
Creating 03containersandvms_dbserver_1 ...
Creating 03containersandvms_dbserver_1 ... done
Creating 03containersandvms_webserver_1 ...
Creating 03containersandvms_webserver_1 ... done
Creating 03containersandvms_clidownload_1 ...
Creating 03containersandvms_clidownload_1 ... done
Attaching to 03containersandvms_dbserver_1, 03containersandvms_webserver_1, 03containersandvms_clidownload_1
dbserver_1     | about to fork child process, waiting until server is ready for connections.
dbserver_1     | forked process: 21
dbserver_1     | 2017-08-23T09:44:27.152+0000 I CONTROL  [main] ***** SERVER RESTARTED *****
dbserver_1     | 2017-08-23T09:44:27.156+0000 I CONTROL  [initandlisten] MongoDB starting : pid=21 port=27017 dbpath=/data/db 64-bit host=113c782030c4
dbserver_1     | 2017-08-23T09:44:27.156+0000 I CONTROL  [initandlisten] db version v3.4.7
....
dbserver_1     | 2017-08-23T09:44:30.862+0000 I FTDC     [initandlisten] Initializing full-time diagnostic data capture with directory '/data/db/diagnostic.data'
dbserver_1     | 2017-08-23T09:44:30.863+0000 I NETWORK  [thread1] waiting for connections on port 27017
clidownload_1  |   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
clidownload_1  |                                  Dload  Upload   Total   Spent    Left  Speed
dbserver_1     | 2017-08-23T09:44:34.678+0000 I NETWORK  [thread1] connection accepted from 172.18.0.3:33478 #1 (1 connection now open)
dbserver_1     | 2017-08-23T09:44:34.681+0000 I -        [conn1] end connection 172.18.0.3:33478 (1 connection now open)
100  1366  100  1366    0     0   188k      0 --:--:-- --:--:-- --:--:--  266k
clidownload_1  | <!DOCTYPE HTML>
clidownload_1  | <html>
clidownload_1  |     <head>
clidownload_1  |         <title>The Møllers</title>
clidownload_1  |     </head>
clidownload_1  |     <body>
clidownload_1  |         <h1>Telephone Book</h1>
...
dbserver_1     | 2017-08-23T09:46:23.807+0000 I NETWORK  [thread1] connection accepted from 172.18.0.1:50576 #6 (4 connections now open)
^CGracefully stopping... (press Ctrl+C again to force)
Stopping 03containersandvms_webserver_1 ... done
Stopping 03containersandvms_dbserver_1 ... done
```

### Cleaning up

```bash
$ docker ps -a
CONTAINER ID        IMAGE                COMMAND                  CREATED             STATUS                       PORTS               NAMES
01a0a11d00d3        appropriate/curl     "sh -c 'sleep 5 &&..."   9 minutes ago       Exited (0) 9 minutes ago                         03containersandvms_clidownload_1
ef4617bdc0d8        helgecph/webserver   "/bin/sh -c ./telb..."   9 minutes ago       Exited (137) 6 seconds ago                       03containersandvms_webserver_1
113c782030c4        helgecph/dbserver    "docker-entrypoint..."   9 minutes ago       Exited (0) 5 seconds ago                         03containersandvms_dbserver_1
```

```bash
$ docker-compose rm -v
``




## Before Cleaning-up Containers

```bash
$ docker images
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
helgecph/dbserver    latest              7672dc76725d        11 seconds ago      359MB
helgecph/webserver   latest              7e20874fe656        30 seconds ago      718MB
mongo                latest              b39de1d79a53        2 weeks ago         359MB
appropriate/curl     latest              f73fee23ac74        3 weeks ago         5.35MB
golang               jessie              6ce094895555        4 weeks ago         699MB
```


