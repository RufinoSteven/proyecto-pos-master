

import {React, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from "universal-cookie";
import Sidebar from "../Components/Sidebar";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from "axios";
export default function AdminDashboard(){
    const cookies = new Cookies();
    const role = cookies.get('role')
    const user = cookies.get('userName')
    const [users, setUsers] = useState([])
    const [invoices, setInvoices] = useState([])
    const [products, setProducts] = useState([])
    const options = {
        chart:{
            type:'line'
        },
        title: {
            text: 'Precios de Insumos en Stock'
          },
          colors:['#000'],
            series: [{
            name: "Precio de insumos",
            data: products.map(x=> x.price)
          }],
          xAxis:{
              categories:products.map(x=> x.itemName)
          },
          yAxis: {
            title: {
                text: 'Precios'
              }
          }  
      }
 
      const options2 = {
        title: {
            text: 'Analisis'
          },
          chart:{
            type: 'bar'},
          
          series: [{
              name: "Total",
            data: invoices.map(x=> x.total)
          },{
            name: "Subtotal",
          data: invoices.map(x=> x.subtotal)

        }],
              title: {
                  text: 'Dinero '
                
            }  
      }
      //http://apiusers.somee.com/api/GetUsers
      const getUsers = async ()=>{
        await axios.get('https://localhost:44396/api/GetUsers').then(response=>{
          setUsers(response.data)
        })
      }
      //http://diplan0120-001-site1.itempurl.com/api/Invoices
      const getInvoices = async ()=>{
        await axios.get('https://localhost:44393/api/Invoices').then(response=>{
            setInvoices(response.data)
        })
      }
      //http://mainserviceapi.somee.com/api/Items
      const getProducts = async ()=>{
        await axios.get('https://localhost:44395/api/Items').then(response=>{
            setProducts(response.data)
        })
      }
    useEffect(()=>{
        getUsers();
        getProducts();
        getInvoices();
        if(role == 2){
            window.location.href='./udashboard';
        } else if(role == undefined){
            window.location.href='./';
        }
        
    },[])

    
    return(
        <Sidebar>
            <div class="container">
        <div class="row d-flex justify-content-center">
            <div class="col-lg-3 col-sm-6">
                <div class="card-box bg-blue">
                    <div class="inner">
                        <h3> {products.length} </h3>
                        <p> Insumos </p>
                    </div>
                    <div class="icon">
                    <i class="fa-solid fa-cart-flatbed"></i>
                    </div>
                    <a href="/products" class="card-box-footer">Ver más <i className="fa fa-arrow-circle-right"></i></a>
                </div>
            </div>

            <div class="col-lg-3 col-sm-6">
                <div class="card-box bg-green">
                    <div class="inner">
                        <h3> {invoices.length} </h3>
                        <p> Analisis creados </p>
                    </div>
                    <div class="icon">
                    <i class="fa-solid fa-file-invoice-dollar"></i>

                    </div>
                    <a href="/invoices" class="card-box-footer">Ver más <i className="fa fa-arrow-circle-right"></i></a>
                </div>
            </div>
            <div class="col-lg-3 col-sm-6">
                <div class="card-box bg-orange">
                    <div class="inner">
                        <h3> {users.length} </h3>
                        <p> Usuarios Creados </p>
                    </div>
                    <div class="icon">
                    <i class="fa fa-users" aria-hidden="true"></i>
                    </div>
                    <a href="/users" class="card-box-footer">Ver más <i className="fa fa-arrow-circle-right"></i></a>
                </div>
            </div>
        </div>
    </div>
    <div className="row">
        <div className="col-md-6     card">
        <HighchartsReact
    highcharts={Highcharts}
    options={options}
  />
        </div>
        <div className="col-md-6 card">
        <HighchartsReact
    highcharts={Highcharts}
    options={options2}
  />
        </div>      
    </div>
        </Sidebar>
    )
}