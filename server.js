var express = require("express")
var app = express()
const formidable = require('formidable')
var port = process.env.PORT || 3000
var hbs = require('express-handlebars');
var path = require('path');
var mime  =  require('mime');
const fs = require('fs');
const { isArray } = require("util");

var tab = [];
let counter = 1;

app.get("/", function (req, res) {
    res.render('upload.hbs');
})

app.get("/upload", function (req, res) {
    res.render('upload.hbs');
})

app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', { files: tab });
})

app.get("/info", function (req, res) {
    res.render('info.hbs');
})


app.post('/handleUpload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {
        if (Array.isArray(files.imagetoupload)) {
            for (let i = 0; i < files.imagetoupload.length; i++) {
                var file = { ...files.imagetoupload[i] }
                file.id = counter
                file.realName = path.basename(file.path);
                file.icon = getExtension(file.type);
                tab.push(file)
                counter++;
            }
        }
        else {
            var file = { ...files.imagetoupload }
            file.id = counter
            file.realName = path.basename(file.path);
            file.icon = getExtension(file.type);
            tab.push(file)
            counter++;
        }
        res.redirect('/filemanager');
    });
});

app.get("/delete/:id", function (req, res) {
    id = req.params.id
    for(let i = 0; i < tab.length; i++)
    {
        if(id == tab[i].id)
        {
            tab.splice(i, 1);
        }
    }
    res.render('filemanager.hbs', { files: tab });
})

app.get("/clearTab", function (req, res) {
    tab = []
    res.render('filemanager.hbs', { files: tab });
    counter = 1;
})

app.get("/info/:id", function (req, res) {
    id = req.params.id
    if(id)
    {
        for(let i = 0; i < tab.length; i++)
        {
            if(id == tab[i].id)
            {
                console.log(tab[i])
                res.render('info.hbs', tab[i]);
            }
        }
    }
    else
    {
        res.render('info.hbs', {subject: "Nie wybrano żadnego pliku"});
    }
})

function getExtension(type)
{
    if(type == "application/x-zip-compressed")
    {
        return "zip";
    }
    ext = mime.getExtension(type)
    if(fs.existsSync(__dirname+"/static/icons/"+ext+".png"))
    {
        return ext
    }
    else
    {
        return "file"
    }
}









app.use(express.static('static'))


app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');                           // określenie nazwy silnika szablonów

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})