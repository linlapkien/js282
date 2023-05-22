// Khai báo thư viện http của node
const http = require('http');
// Khai báo biến env
require('dotenv').config();
// Khai báo cổng của dịch vụ
const port = process.env.PORT;
// Khai báo thư viện Xử lý tập tin của node
const fs = require('fs');
// Khai báo thư viện mongoDB
const db = require('./mongoDB');
const sendMail = require('./sendMail');

// Xây dựng dịch vụ
const dich_vu = http.createServer((req, res) => {
  let method = req.method;
  let url = req.url;
  let ketqua = `Dịch vụ NodeJS - Method:${method} - Url:${url}`;
  // Cấp quyền
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (method == 'GET') {
    if (url == '/dsTivi') {
      db.getAll('Tivi').then((result) => {
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(JSON.stringify(result));
      });
    } else if (url == '/dsHocsinh') {
      db.getAll('Hocsinh').then((result) => {
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(JSON.stringify(result));
      });
    } else if (url == '/dsMathang') {
      db.getAll('Mat_hang').then((result) => {
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(JSON.stringify(result));
      });
    } else if (url == '/Cuahang') {
      db.getAll('Cua_hang').then((result) => {
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(JSON.stringify(result));
      });
    } else if (url == '/dsDienthoai') {
      db.getAll('Dien_thoai').then((result) => {
        res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
        res.end(JSON.stringify(result));
      });
    } else {
      res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
      res.end(JSON.stringify(result));
    }
  } else if (method == 'POST') {
    // Lấy dữ liệu client gởi về
    let noi_dung_nhan = ``;
    req.on('data', (dulieu) => {
      noi_dung_nhan += dulieu;
    });

    if (url == '/Dangnhap') {
      req.on('end', () => {
        let ket_qua = {
          Noi_dung: true,
        };
        let user = JSON.parse(noi_dung_nhan);
        let dieukien = {
          $and: [
            { Ten_Dang_nhap: user.Ten_Dang_nhap },
            { Mat_khau: user.Mat_khau },
          ],
        };
        //db.getOne(collectionName, filter)
        db.getOne('Nguoi_dung', dieukien)
          .then((result) => {
            console.log(result);
            ket_qua.Noi_dung = {
              Ho_ten: result.Ho_ten,
              Nhom: {
                Ma_so: result.Nhom_Nguoi_dung.Ma_so,
                Ten: result.Nhom_Nguoi_dung.Ten,
              },
            };
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          })
          .catch((err) => {
            console.log(err);
            ket_qua.Noi_dung = false;
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          });
      });
    } else if (url == '/Lienhe') {
      req.on('end', () => {
        let kq = {
          noi_dung: true,
        };
        let from = 'admin@shopTT.com';
        let to = 'linlapkien@gmail.com';
        let subject = 'Liên hệ';
        let body = '<strong>Báo giá Iphone 14 ProMax </strong>';
        sendMail
          .Goi_Thu_Lien_he(from, to, subject, body)
          .then((result) => {
            console.log(result);
            res.end(JSON.stringify(kq));
          })
          .catch((err) => {
            console.log(err);
            kq.noi_dung = false;
            res.end(JSON.stringify(kq));
          });
      });
    } else if (url == '/Dathang') {
      req.on('end', () => {
        let dsDonhang = JSON.parse(noi_dung_nhan);
        let ket_qua = { Noi_dung: [] };
        dsDonhang.forEach((item) => {
          let collectionName = 'tivi';
          collectionName =
            item.nhom == 2 ? 'food' : item.nhom == 3 ? 'mobile' : 'tivi';
          let filter = {
            Ma_so: item.key,
          };
          db.getOne(collectionName, filter)
            .then((result) => {
              item.dathang.So_Phieu_Dat = result.Danh_sach_Phieu_Dat.length + 1;
              result.Danh_sach_Phieu_Dat.push(item.dathang);
              // Update
              let capnhat = {
                $set: { Danh_sach_Phieu_Dat: result.Danh_sach_Phieu_Dat },
              };
              let obj = {
                Ma_so: result.Ma_so,
                Update: true,
              };
              db.updateOne(collectionName, filter, capnhat)
                .then((result) => {
                  if (result.modifiedCount == 0) {
                    obj.Update = false;
                  }
                  ket_qua.Noi_dung.push(obj);
                  if (ket_qua.Noi_dung.length == dsDonhang.length) {
                    res.end(JSON.stringify(ket_qua));
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
            });
        });
      });
    } else if (url == '/ThemDienthoai') {
      req.on('end', function () {
        let mobile = JSON.parse(noi_dung_nhan);
        let ket_qua = { Noi_dung: true };
        db.insertOne('Dien_thoai', mobile)
          .then((result) => {
            console.log(result);
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          })
          .catch((err) => {
            console.log(err);
            ket_qua.Noi_dung = false;
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          });
      });
    } else if (url == '/XoaDienthoai') {
      req.on('end', function () {
        let mobile = JSON.parse(noi_dung_nhan);
        let ket_qua = { Noi_dung: true };
        db.deleteOne('Dien_thoai', mobile)
          .then((result) => {
            console.log(result);
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          })
          .catch((err) => {
            console.log(err);
            ket_qua.Noi_dung = false;
            res.writeHead(200, { 'Content-Type': 'text/json;charset=utf-8' });
            res.end(JSON.stringify(ket_qua));
          });
      });
    }
  } else {
    res.end(JSON.stringify(result));
  }
});

dich_vu.listen(port, () => {
  console.log(`Service Runing http://localhost:${port}`);
});
