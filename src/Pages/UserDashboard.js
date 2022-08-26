

import {React, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from "universal-cookie";
import Sidebar from "../Components/Sidebar"
import axios from "axios";
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

export default function UserDashboard(props){
    const cookies = new Cookies();
    const role = cookies.get('role')
    const user = cookies.get('userName')
    const [users, setUsers] = useState('')
    const [invoices, setInvoices] = useState([])
    const [products, setProducts] = useState([])
    const options = {
        chart:{
            type:'column'
        },
        title: {
            text: 'Precios de Productos en Stock'
          },
          colors:['#000'],
          series: [{
              name: "Precio de producto",
            data: products.map(x=> x.price)
          }],
          xAxis:{

              categories:products.map(x=> x.itemName)
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
                  text: 'Dinero cotizado'
                
            }  
      }
      const getInvoices = async ()=>{
        await axios.get('https://localhost:44393/api/Invoices').then(response=>{
            setInvoices(response.data)
        })
      }
      const getProducts = async ()=>{
        await axios.get('https://localhost:44395/api/Items').then(response=>{
            setProducts(response.data)
        })
      }
    useEffect(()=>{
        getProducts();
        getInvoices();
        if(role == 1){
            window.location.href='./adashboard';
        } else if(role == undefined){
            window.location.href='./';
        }
    },[])
    return(
        <Sidebar>
            <div class="container">
        <div class="row d-flex justify-content-center">
            <div class="col-lg-4 col-sm-6">
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

            <div class="col-lg-4 col-sm-6">
                <div class="card-box bg-green">
                    <div class="inner">
                        <h3> {invoices.length} </h3>
                        <p> Analisis realizados </p>
                    </div>
                    <div class="icon">
                    <i class="fa-solid fa-file-invoice-dollar"></i>

                    </div>
                    <a href="/invoices" class="card-box-footer">Ver más <i className="fa fa-arrow-circle-right"></i></a>
                </div>
            </div>

        </div>
    </div>
    <div className="row card-group">
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