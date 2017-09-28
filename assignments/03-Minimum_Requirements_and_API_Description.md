# Important Features

Until the hand-over date -the **2. Nov.** 2017- you have to develop at least the following features for your Hackernews clone. They should be described by complete Use Cases in you Requirements Analysis Document. 

  * Display a set of stories or comments on your system's front page
  * Stories or comments are posted by users, which have to be registered to and logged into the system to be able to post
  * Users login to the system via a separate page
  * Users are identified by a user name and a password
  * New users can register to the system, via a separate page.
  * The complete REST API, as defined in the following.

This is the set of requirements, which must be implemented so that we can run the second part of the course successfully.


# Your REST API

## Accepting Posts

As said, your REST API has to be able to react on a POST request to `http://<your_host>:<your_port>/post`. The data coming in the request body is a JSON blob of the following format:

```json
{"username": "<string>", 
 "post_type": "<string>", 
 "pwd_hash": "<string>", 
 "post_title": "<string>", 
 "post_parent": <int>, 
 "hanesst_id": <int>, 
 "post_text": "<string>"}
```

If you were to use Go structs to define your data exchange objects an item sent to the route could look as in the following:

```Go
type Item struct {
    User       string `json:"username"`
    Pwd        string `json:"pwd_hash"`
    PostType   string `json:"post_type"`
    PostTitle  string `json:"post_title"`
    PostText   string `json:"post_text"`
    PostParent int    `json:"post_parent"`
    HanesstID  int    `json:"hanesst_id"`
}
```

The strings for `post_type` can be `story`, `comment`, `poll`, or `pollopt`.

In the following, you can see four examples of the JSON data that will be sent to your systems `http://<your_host>:<your_port>/post` route from the simulator.

```json
{"username": "pg", 
 "post_type": "story", 
 "pwd_hash": "E0Ba6XfUui", 
 "post_title": "Y Combinator", 
 "post_parent": -1, 
 "hanesst_id": 1, 
 "post_text": ""}
```

```json
{"username": "phyllis", 
 "post_type": "story", 
 "pwd_hash": "aioCQdsy3E", 
 "post_title": "A Student's Guide to Startups", 
 "post_parent": -1, 
 "hanesst_id": 2, 
 "post_text": ""}
```

```json
{"username": "phyllis", 
 "post_type": "story", 
 "pwd_hash": "aioCQdsy3E", 
 "post_title": "Woz Interview: the early days of Apple", 
 "post_parent": -1, 
 "hanesst_id": 3, 
 "post_text": ""}
```

```json
{"username": "onebeerdave", 
 "post_type": "story", 
 "pwd_hash": "3RBszFhikO", 
 "post_title": "NYC Developer Dilemma", 
 "post_parent": -1, 
 "hanesst_id": 4, "post_text": ""}
```


### More Examples and Testing your REST API

You can see more examples of how the data, which will be posted to your systems, looks like in the file `student_tester.py`. You can actually use that program from your VMs (any \*nix system with a Python 3.X installation and `requests` module installed, which is the case for your Ubuntu VM).

You can run this program from your VM with the following command:

```bash
python student_tester.py http://<your_host>[:<your_port>]
```

That is, a concrete call to run the tester program could look like (in case system runs on this machine on port `8080`):

```bash
python student_tester.py http://localhost:8080
```

If your system can digest the sent messages, then it should be prepared for the simulator.


### Users? Passwords?

As you can see above, there is a set of users, which will sent a 'hash' of their password. That is not a real hash. It is just a small mambo-jumbo string that you might want to associate with a user on your system. You can find a list of users and their 'passwords' in the file `users.csv.bz2`. Note it is a compressed CSV file containing 340992 user names and 'passwords'. From the first session you should know how to uncompress it.




## Providing the Latest Digested Post

An HTTP `GET` request to your system on the `http://<your_host>:<your_port>/latest` route shall return an integer corresponding to the latest `hanesst_id` of a post sent by the simulator, which your system successfully digested.

For example, if the latest post sent by the simulator, which is registered by your system is the post with JSON data:

```json
{"username": "sergei", "post_type": "story", "pwd_hash": "1MHhed3L9i", "post_title": "An alternative to VC: &#34;Selling In&#34;", "post_parent": -1, "hanesst_id": 42, "post_text": ""}
```

then the `curl` call to your system should return `42`.

```bash
curl http://localhost:8080/latest
42
```


## Providing Status Information

An HTTP `GET` request to your system on the `http://<your_host>:<your_port>/status` route shall return a string -at least either `Alive`, `Update`, or `Down`- denoting the state of your system.

Lets say, that you have at least three states, which your system should return:

  * up-and-running corresponds to `Alive`
  * under update corresponds to `Update`
  * the system is down for some reason corresponds to `Down`


That is, in case your system is just running and digesting incoming user requests a call to it's `/status` route shall return `Alive`.

```bash
curl http://localhost:8080/status
Alive
```

