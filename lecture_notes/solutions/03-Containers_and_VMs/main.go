package main

import (
	"gopkg.in/mgo.v2"
	"html/template"
	"log"
	"net/http"
)

type Person struct {
	Name    string
	Phone   string
	Address string
	City    string
}

type PersonList struct {
	Persons []Person
}

var html = `<!DOCTYPE HTML>
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
          {{range $index, $element := .Persons}}
      	  <tr>
            <td>{{$index}}</td>
            <td>{{$element.Name}}</td>
            <td>{{$element.Phone}}</td>
            <td>{{$element.Address}}</td>
            <td>{{$element.City}}</td>
          </tr>
          {{end}}
        </table>
        <p></p>
        Data taken from <a href="https://www.krak.dk/person/resultat/møller">Krak.dk</a>
    </body>
</html>
`

func queryDB() []Person {
	session, err := mgo.Dial("192.168.20.3:27017")
	if err != nil {
		panic(err)
	}
	defer session.Close()

	session.SetMode(mgo.Monotonic, true)
	c := session.DB("test").C("people")

	results := []Person{}
	err = c.Find(nil).All(&results)
	if err != nil {
		log.Fatal(err)
	}

	return results
}

func displayPage(res http.ResponseWriter, req *http.Request) {
	t, err := template.New("tbook").Parse(html)
	if err != nil {
		log.Fatal(err)
	}

	results := queryDB()
	templateData := &PersonList{
		Persons: results,
	}
	// Execute the parsed template writing the output to
	// the writer. Pass the user value for processing.
	t.Execute(res, templateData)
}

func main() {

	http.HandleFunc("/", displayPage)
	http.ListenAndServe(":8080", nil)
}
