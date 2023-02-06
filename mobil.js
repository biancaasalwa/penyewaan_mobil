//inisiasi library
const express = require("express")
const multer = require("multer") //untuk upload file
const path = require("path") // untuk memanggil path direktori
const fs = require("fs") //untuk manajemen file
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const moment = require("moment")

//implementation
const app = express()
app.use(express.json())
app.use(express.static(__dirname));
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//moment
//multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        // set file storage 
        cb(null, './image');
    },
    filename: (req, file, cb) => {
        // generate file name 
        cb(null, "image-"+ Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({storage: storage})


//create MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password : "",
    database: "penyewaan"
})

db.connect(error=>{
    if(error){
        console.log(error.message)
    }else{
        console.log("MySQL Connected")
    }
})


//----------------------------------------------------CRUD MOBIL----------------------------------------------------

//endpoint ambil data mobil
app.get("/mobil", (req, res) => {
    //create sql query
    let sql = "select * from mobil"

    //run query
    db.query(sql, (error, result) => {
        if(error) throw error
        res.json({
            count: result.length,
            data: result
        })
    })
})

//endpoint menambah data mobil baru
app.post("/mobil", upload.single("image"), (req, res) => {
    //prepare data
    let data = {
        nomor_mobil : req.body.nomor_mobil,
        merk : req.body.merk,
        jenis : req.body.jenis,
        warna : req.body.warna,
        tahun_pembuatan : req.body.tahun_pembuatan,
        biaya_sewa_per_hari : req.body.biaya_sewa_per_hari,
        image : req.file.filename
    }

    if (!req.file) {
        //jika tidak file yang diupload
        res.json({
            message: "Tidak ada file yang dikirim"
        })
    } else {
        //create sql insert
        let sql = "insert into mobil set ?"

        //run query
        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasil"
            })
        })
    }
})

//endpoint untuk mengubah data mobil
app.put("/mobil", upload.single("image"), (req, res) => {
    //parameter perubahan data
    let data = null, sql = null
    let param = { id_mobil: req.body.id_mobil }

    if(!req.file) { 
        data = {
            nomor_mobil : req.body.nomor_mobil,
            merk : req.body.merk,
            jenis : req.body.jenis,
            warna : req.body.warna,
            tahun_pembuatan : req.body.tahun_pembuatan,
            biaya_sewa_per_hari : req.body.biaya_sewa_per_hari,
        }
    } else {
        data = {
            nomor_mobil : req.body.nomor_mobil,
            merk : req.body.merk,
            jenis : req.body.jenis,
            warna : req.body.warna,
            tahun_pembuatan : req.body.tahun_pembuatan,
            biaya_sewa_per_hari : req.body.biaya_sewa_per_hari,
            image : req.file.filename
        }

        //get data yang akan diupdate untuk mendapatkan nama file yang lama
        sql = "select * from mobil where ?"
        //run query
        db.query(sql, param, (err,result) => {
            if (err) throw err
            //tampung nama file lama
            let filename = result[0].image

            //hapus file lama
            let dir = path.join(__dirname, "image", filename)
            fs.unlink(dir, (error) => {})
        })

    }

    //create sql update
    sql = "update mobil set ? where ?"

    // run sql update
    db.query(sql, [data,param], (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

//endpoint untuk menghapus data mobil
app.delete("/mobil/:id_mobil", (req,res) => {
    let param = {id_mobil: req.params.id_mobil}

    //ambil data yang akan dihapus
    let sql = "select * from mobil where ?"

    //run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        //tampung nama file lama
        let filename = result[0].image

        //hapus file nama
        let dir = path.join(__dirname, "image",filename)
        fs.unlink(dir, (error) => {})
    })

    //create sql delete
    sql = "delete from mobil where ?"

    // run query
    db.query(sql, param, (error, result) => {
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }
    })
})

//--------------------------------------------------CRUD PELANGGAN--------------------------------------------------

//end-point akses data pelanggan
app.get("/pelanggan", (req,res)=>{
    //cretae sql query
    let sql = "select * from pelanggan"

    //run query
    db.query(sql, (error, result)=>{
        let response = null
        if(error){
            response ={
                message: error.message //pesan error
            }
        } else{
            response ={
                count: result.length, //jumlah data
                pelanggan: result //isi data
            }
        }
        res.json(response)//send response
    })
})

//end-point akses data mobil berdasarkan id_mobil tertentu
app.get("/pelanggan/:id", (req,res)=>{
    let data ={
        id_pelanggan: req.params.id_pelanggan
    }

    //create sql query
    let sql = "select * from pelanggan where?"

    //run query
    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                count:result.length, //jumlah data
                pelanggan:result //isi data
            }
        }
        res.json(response)//send response
    })
})

//end-point menyimpan data pelanggan
app.post("/pelanggan", (req,res)=>{

    //prepare data
    let data ={
        id_pelanggan : req.body.id_pelanggan,
        nama_pelanggan : req.body.nama_pelanggan,
        alamat_pelanggan : req.body.alamat_pelanggan,
        kontak : req.body.kontak
    }

    //create sql query insert
    let sql = "insert into pelanggan set?"

    //run query
    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response ={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)//send response
    })
})

//end-point mengubah data pelanggan
app.put("/pelanggan",(req,res)=>{

    //prepare data
    let data =[
        //data
        {
            id_pelanggan : req.body.id_pelanggan,
            nama_pelanggan : req.body.nama_pelanggan,
            alamat_pelanggan : req.body.alamat_pelanggan,
            kontak : req.body.kontak
        },

        //parameter(primary key)
        {
            id_pelanggan: req.body.id_pelanggan
        }
    ]

    let sql = "update pelanggan set ? where ?"

    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response)
    })
})

app.delete("/pelanggan/:id", (req,res)=>{
    let data = {
        id_pelanggan: req.params.id_pelanggan
    }

    let sql = "delete from pelanggan where ?"

    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response)
    })
})

//------------------------------------------------CRUD KARYAWAN-------------------------------------------------------

//end-point akses data karyawan
app.get("/karyawan", (req,res)=>{
    //cretae sql query
    let sql = "select * from karyawan"

    //run query
    db.query(sql, (error, result)=>{
        let response = null
        if(error){
            response ={
                message: error.message //pesan error
            }
        } else{
            response ={
                count: result.length, //jumlah data
                karyawan: result //isi data
            }
        }
        res.json(response)//send response
    })
})

//end-point akses data karyawan berdasarkan id_karyawan tertentu
app.get("/karyawan/:id", (req,res)=>{
    let data ={
        id_karyawan: req.params.id_karyawan
    }

    //create sql query
    let sql = "select * from karyawan where?"

    //run query
    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                count:result.length, //jumlah data
                karyawan:result //isi data
            }
        }
        res.json(response)//send response
    })
})

//end-point menyimpan data karyawan
app.post("/karyawan", (req,res)=>{

    //prepare data
    let data ={
        nama_karyawan : req.body.nama_karyawan,
        alamat_karyawan : req.body.alamat_karyawan,
        kontak : req.body.kontak,
        username: req.body.username,
        password: req.body.password
    }

    //create sql query insert
    let sql = "insert into karyawan set?"

    //run query
    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response ={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data inserted"
            }
        }
        res.json(response)//send response
    })
})

//end-point mengubah data karyawan
app.put("/karyawan",(req,res)=>{

    //prepare data
    let data =[
        //data
        {
            nama_karyawan : req.body.nama_karyawan,
            alamat_karyawan : req.body.alamat_karyawan,
            kontak : req.body.kontak,
            username: req.body.username,
            password: req.body.password
        },

        //parameter(primary key)
        {
            id_karyawan: req.body.id_karyawan
        }
    ]

    let sql = "update karyawan set ? where ?"

    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data updated"
            }
        }
        res.json(response)
    })
})

app.delete("/karyawan/:id", (req,res)=>{
    let data = {
        id_karyawan: req.params.id_karyawan
    }

    let sql = "delete from karyawan where ?"

    db.query(sql, data, (error, result)=>{
        let response = null
        if(error){
            response={
                message: error.message
            }
        }else{
            response={
                message: result.affectedRows + " data deleted"
            }
        }
        res.json(response)
    })
})

app.listen(8000, ()=>{
    console.log("anjazzz")
})