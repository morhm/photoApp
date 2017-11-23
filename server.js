const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

var app = express();

console.log(__dirname);

app.use(express.static(__dirname + '/static/webapp'));
app.use(express.static(__dirname + '/static/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var getData = new Promise((resolve, reject) => {
	fs.readFile(__dirname + '/data.json', 'utf8', (err, data) => {
		if (err) reject(err);
		resolve(data);
	});
});

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/app.html');
})

app.get( '/feed', (req, res) => {
	getData.then( (data) => {
		res.send(data);
	});
});

app.post( '/item/add_comment', (req, res) => {
 	let commentObj = {};
 	commentObj.author_id = req.body.author_id;
 	commentObj.comment = req.body.text;
 	getData.then( (data) => {
 		let feed = JSON.parse(data);
 		let item = feed.items.find( i => {
 			return i.item_id == req.body.id;
 		});
 		item.comments.push(commentObj);
 		/*console.log('comment obj: ' + commentObj);
 		console.log(item);*/
		fs.writeFileSync('./data.json', JSON.stringify(feed));
	});
});

app.get( '/item', (req, res) => {
	getData.then( (data) => {
		let feed = JSON.parse(data);
		let item = feed.items.find( (item) => {
			return item.item_id == req.query.id;
		});
		res.send({
			item,
			people: feed.people
		});
	});
});

app.listen(8080, () => {
	console.log('server is up on port 8080');
});