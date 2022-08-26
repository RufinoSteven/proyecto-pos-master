

import {React, useEffect, useRef, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from "universal-cookie";
import Sidebar from "../Components/Sidebar"
import axios from 'axios';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import { render } from "@testing-library/react";
import Invoices from "./Invoices";


export default function NewInvoice(){
    const MySwal = withReactContent(Swal)
    const cookies = new Cookies();
    const role = cookies.get('role')
    const user = cookies.get('userName')
    const baseUrlItems = "https://localhost:44395/api/Items"
    const baseUrl = "https://localhost:44393/api/Invoices"
    const baseUrlDetalle = "https://localhost:44393/api/Invoices/api/Detalle"
    const [data,setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [subTotal, setSubTotal] = useState(0);
    const [totalQty, setTotalQty] = useState(0);
    const [qty, setQty] = useState(0);
    const [itemSelected, setItemSelected] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [invoiceID, setInvoiceID] = useState(0);
    const [nombreA, setNombreA] = useState ('');
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      })



    useEffect(()=>{
        if(role == undefined){
            window.location.href='./';
        }
        Get();
    },[])

    const removeItem = async id=>{
        var idx = tableData.map(i=>i.id).indexOf(id)
        console.log(idx)
        setTotalQty(totalQty-tableData[idx].qty)
        setTotal(total-((tableData[idx].price * tableData[idx].qty) + (tableData[idx].price * tableData[idx].qty)))
        setSubTotal(subTotal-(tableData[idx].price * tableData[idx].qty))
        if(tableData.length <= 1){
            setTableData([])
        } else{
            setTableData(tableData.filter((obj)=> { return obj !== tableData[idx]}))
        }
        
    }

    const handleChange2 = e =>{
       setNombreA(e.target.value);
    }
   
    const postInvoice = async () =>{
     
        var date = new Date();
        var invoice = ({
            nombre: nombreA, 
            items: serializeJSON(tableData),
            subtotal:subTotal,
            total:total,
            invoiceDate: date.toISOString(),
        })
        debugger;
        console.log(invoice.invoiceDate)
        Post(invoice)

    }

    const GetID = async ()=>{
       axios.get(baseUrl).then(response=>{
           debugger;
           const inv = response.data;
           setInvoiceID(inv[inv.length-1].id + 1);

       }) 
    }
    
    const Post = async (invoice)=>{
        console.log("enviando data")
        await axios.post(baseUrl, invoice).then(response=>{
            console.log(response)
            debugger;
            InsertMany();
            updateInventory();
            MySwal.fire({
                title:'Se ha creado correctamente',
                icon:'success',
                button:'Ok',
                
                }).then(()=>{
                    window.location.href = './invoices'
                })
        }).catch(err=>{
            MySwal.fire({
                title:'Error de Servidor',
                icon:'error',
                text:err,
                button:'Ok'
                })
        })
    }

    const updateInventory = async ()=>{
        var idx;
        var product;
        tableData.forEach(item => {
            idx = data.map(i=>i.id).indexOf(item.id)
            product = data[idx];

            product = {
                ...product,
                qty: product.qty - item.qty
            }
            axios.put(baseUrlItems+"/"+item.id,product);
        });
    }
    

    const InsertMany = async ()=>{
        debugger;
        tableData.map(item => {
            debugger;
            axios.post(baseUrlDetalle, {analisis_id: invoiceID, item_id: item.id, qty: item.qty}).then(()=>{
                console.log("insertado!!!")
            })
        })
    }

    const addProduct = async ()=>{
        GetID();
        console.log(qty)
        setTotalQty(totalQty+parseInt(qty))
        setTotal(total+((itemSelected.price * qty) + (itemSelected.price * qty)))
        setSubTotal(subTotal+(itemSelected.price * qty))
        setTableData(tableData.concat({
            id:itemSelected.id,
            itemName:itemSelected.itemName,
            price:itemSelected.price,
            descripcion:itemSelected.descripcion,
            unidad:itemSelected.unidad,
            qty:qty
        }));
        
    }



    const serializeJSON = json =>{
        const jsonString =  JSON.stringify(json);
        return jsonString; 
    } 

    const deserializeJSON = jsonString =>{
        const json =  JSON.parse(jsonString);
        setItemSelected(json); 
    }  
    const handleChange = async e=>{
        await deserializeJSON(e.target.value)
        console.log(itemSelected);
    }

    const handleQty = async e=>{
        await setQty(e.target.value)
        console.log(qty);
    }

    const Get=async()=>{
        await axios.get(baseUrlItems).then(response=>{
          setData(response.data);
          console.log(response);
      }).catch(e=>{
        MySwal.fire({
            title:'Error de Servidor',
            icon:'error',
            text:e,
            button:'Ok'
            })
      })
      }
    return(
        <Sidebar>
         <div className="input-group">
        <a href="/invoices"   type="button" class="btn btn-dark" >   volver </a>
        </div>  
        <br></br>
          <input type="text" className="form-control" placeholder="Nombre del Análisis" value={nombreA} name="nombreA" onChange={handleChange2}/>
          
          <br />
            <div className="container container-fluid">
                <div className="card">
                <div className="card-header">
                    <div className="action-btn">
                        <div class="input-group input-item">
                            <div className="form-group">
              
                            </div>
                            
                        <select id="item" class="form-select" placeholder="Buscar" aria-label="Buscar" aria-describedby="basic-addon2" onChange={handleChange}>
                            <option value="0" selected>Seleccionar insumos...</option>
                        {data.map(item=>{
                            return(
                            <option value={JSON.stringify(item)}>{item.id}# {item.itemName}</option>
                        )})}
                        </select>
                        </div>
                        <div class="form-inline sm-2 input-qty">
                        <input type="number" min='1' max={itemSelected.qty} onChange={handleQty} name="inputQty" class="form-control" placeholder="Cantidad" aria-label="Buscar" aria-describedby="basic-addon2" />
                        </div>
                          
      <a  className = "btn btn btn-primary btn-new" onClick={addProduct}> Agregar Insumo <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-plus-fill" viewBox="0 0 16 16">
  <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM8.5 6v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 1 0z"/>
</svg></a>
            </div>
                </div>
                <div className="card-body">
                    <table class="invoice-table">
                        <thead>
                            <th>Codigo</th>
                    
                            <th>Insumo</th>
                            <th>Alcanse</th>
                            <th>Cantidad</th>
                            <th>Unidad</th>
                            <th>Subtotal</th>
                            <th>Total</th>
                            <th></th>
                        </thead>
                        <tbody id="invoice-body">
                                {tableData.map(item=>{
                                    return(
                                        <tr>
                                            <td>{item.id}</td>
                                            <td>{item.itemName}</td>
                                            <td>{item.descripcion}</td>
                                            <td>{item.qty}</td>
                                            <td>{item.unidad}</td>
                                            <td>{formatter.format((item.price * item.qty))}</td>
                                            <td>{formatter.format((item.price * item.qty) + (item.price * item.qty))}</td>
                                            <td><a class="btn" onClick={()=>removeItem(item.id)}><i class="fa-solid fa-circle-xmark text-danger"></i></a></td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                        <tfoot>
                        {'\n'}
                       

                     
                    <tr>
                
                        <th colspan="6" className="text-right">Total:</th>
                        <td>{formatter.format(total.toFixed(2))}</td>

                    </tr>
                </tfoot>
                    </table>   
                </div>
                <div className="card-footer">
                    <div className="row">
                        <div className="input-group">
                            <button onClick={()=>postInvoice()} type="button" class="btn btn-success">Guardar Analisis</button>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </Sidebar>
    )
}