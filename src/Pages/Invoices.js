 //<div  id="refresh">   <a href="/invoices" class="input-group-text search btn-primary">Actualizar</a></div>//

import {React, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import Cookies from "universal-cookie";
import Sidebar from "../Components/Sidebar"
import axios from 'axios';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
import ReactHTMLTableToExcel from "react-html-table-to-excel";

export default function Invoices(props){
    const MySwal = withReactContent(Swal)
    const cookies = new Cookies();
    const role = cookies.get('role')
    const user = cookies.get('userName')
    const baseUrl = "https://localhost:44393/api/Invoices"
    const baseUrlDetalle = "https://localhost:44395/api/Items/GetDetalle/"
    const baseUrlItems = "https://localhost:44395/api/Items"
    const [data,setData] = useState([]);
    var detalles = [];
    const [detail, setDetail] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [modalEditar, setModalEditar]=useState(false);
    const [modalView, setModalView]=useState(false);
    const [modalDelete, setModalDelete]=useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState({
        id: '',
        nombre: '',
        items: '',
        subtotal:0,
        total:0,
        invoiceDate: ''
    });
    const [searchInput, setSearchInput] = useState("");
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      })
    const handleChange = e =>{
        const {name,value} = e.target;
        setSelectedInvoice({
          ...selectedInvoice,
          [name]:value
        });
      
      }
      const addItem = async(item) =>{
        debugger;
        console.log(item)
        setDetail(detail.concat(item))
      }
      const openModalView=()=>{
        debugger;
        setModalView(!modalView);
      }
      const abrirCerrarModalEditar=()=>{
        setModalEditar(!modalEditar);
      }
       const openModalDelete=()=>{
        setModalDelete(!modalDelete);
      }
      const handleSearch=e=>{
        setSearchInput(e.target.value);
      }
      const getDetail=async (id)=>{
        debugger;
        await axios.get(baseUrlDetalle+id).then(response=>{
          setDetail(response.data)
        }).catch(e=>console.log(e))
        console.log(detail)
      }
      const filterSearch=(search)=>{
        return function(x){
            return (x.id.toString().toLowerCase().includes(search.toLowerCase()) ||  x.nombre.toString().toLowerCase().includes(search.toLowerCase()) || !search)
        }
    }


      const Get=async()=>{
        await axios.get(baseUrl).then(response=>{
          setData(response.data);
          setTableData(response.data.reverse());
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
      
      const GetDate = dateString =>{
        debugger;
          const date = new Date(dateString);
          console.log(date.getDay())
          return date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()
      }

      
        const Delete=async()=>{
          await axios.delete(baseUrl+"/"+selectedInvoice.id)
          .then(response=>{
           setData(data.filter(invoice=>invoice.id!==response.data));
            openModalDelete();
            MySwal.fire({
              title:'Eliminado satisfactoriamente!',
              icon:'success',
              button:'Ok'
              })
          }).catch(error=>{
            console.log(error);
          })
        }

        
      
        
      const setInvoice=async (invoice, option)=>{
        await getDetail(invoice.id);
        setSelectedInvoice(invoice);
        (option==="View")? 
        openModalView() : openModalDelete(); 
      }

    useEffect(()=>{
        if(role == undefined){
            window.location.href='./';
        }
        Get();
    },[])
    return(
        <Sidebar>
            <div className="action-btn">
        <div class="input-group sm-7">
            <input type="text" class="form-control" onChange={handleSearch} value={searchInput} placeholder="Buscar" aria-label="Buscar" aria-describedby="basic-addon2" />
            <span class="input-group-text search btn-primary" id="basic-addon2"><i className="fa fa-search"></i></span>
        </div>  
      <a className = "btn btn btn-dark btn-new" href="./newInvoice"> Nuevo Analisis <i className="fa fa-plus-square"></i></a>
      </div>
     
      <table className="table table-striped">
        <thead className = "">
          <tr>
            <th># Analisis</th>
            <th>Nombre</th>
            <th>Fecha</th>
            <th>Subtotal</th>
            <th>Total</th>
            <th>Acciones</th>

          </tr>
        </thead>

        <tbody>
          {data && 
          data.filter(filterSearch(searchInput)).map(invoice =>(
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>{invoice.nombre}</td>
              <td>{GetDate(invoice.invoiceDate)}</td>
              <td>{formatter.format(invoice.subtotal.toFixed(2))}</td>
              <td>{formatter.format(invoice.total.toFixed(2))}</td>
              <td>
                <button class="btn btn-primary"  title="Ver analisis"  onClick={()=>setInvoice(invoice, "View")}><i class="fa-solid fa-eye"></i></button>{" "}
                <button class="btn btn-danger"  title="Eliminar"  onClick={()=>setInvoice(invoice, "Delete")}><i class="fa-solid fa-trash"></i></button> {" "}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
      <Modal isOpen = {modalView}>
      <ModalHeader> Detalle de Analisis: {selectedInvoice.nombre}</ModalHeader>
      <ModalBody>
        <div className="container">
            <table className="table table-striped table-borderless" id="tablanalisis" >
                <thead className="table-header">
                    <th>Codigo</th>
                    
                    <th>Insumo</th>
                    <th>Alcance</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Subtotal</th>
                    <th>Total</th>
                </thead>
                <tbody>
                {detail && detail.map(item=>{
                    console.log(detail)
                    return(
                       
                          <tr>
                            <td>{item.id}</td>
                            <td>{item.itemName}</td>
                            <td >{item.descripcion}</td>
                            <td>{item.qty}</td>
                            <td>{item.unidad}</td>
                            <td>{formatter.format(item.price)}</td>
                            <td>{formatter.format(item.price  + (item.price))}</td>
                        </tr>
                        
                    )
                })}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="6" className="text-right"><strong>Total: </strong></td>
                        
                        <td>{formatter.format(selectedInvoice.total.toFixed(2))}</td>

                    </tr>
                </tfoot>
                
            </table>
        </div>
      </ModalBody>
      <ModalFooter>
        <div aling="center">
<ReactHTMLTableToExcel 

 className="btn btn-success"
 id="botonExportarExcel"
 table="tablanalisis"
 filename="Analisis"
 sheet="Hoja1"
 buttonText="Exportar a Excel"

/>

        </div>
       <button className="btn btn-primary" onClick={()=>openModalView()}>Cancelar</button>
      </ModalFooter>
    </Modal>
    <Modal isOpen={modalDelete}>
        <ModalBody>
        ¿Estás seguro que deseas eliminar este Analisis # (<b>{selectedInvoice && selectedInvoice.id}</b>)?
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-danger" onClick={()=>Delete()}>
            Sí
          </button>
          <button
            className="btn btn-secondary"
            onClick={()=>openModalDelete()}>
            No
          </button>
        </ModalFooter>
      </Modal>
        </Sidebar>
    )
}