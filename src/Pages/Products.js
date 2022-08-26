

import {React, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from "universal-cookie";
import Sidebar from "../Components/Sidebar"
import axios from 'axios';
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'


export default function Products(props){
    const MySwal = withReactContent(Swal)
    const cookies = new Cookies();
    const role = cookies.get('role')
    const user = cookies.get('userName')
    const baseUrl = "https://localhost:44395/api/Items"
    const [data,setData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [modalInsertar,setModalInsertar] = useState(false);
    const [modalEditar, setModalEditar]=useState(false);
    const [modalEliminar, setModalEliminar]=useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState({
        id: '',
        codSap:'',
        itemName: '',
        unidad: '',
        price:'',
        familia: '',
        descripcion: ''
        
    });
    const [searchInput, setSearchInput] = useState("");
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      })
    const handleChange = e =>{
        const {name,value} = e.target;
        setProductoSeleccionado({
          ...productoSeleccionado,
          [name]:value
        });
      
      }
      
      const abrirCerrarModalInsertar=()=>{
        setModalInsertar(!modalInsertar);
      }
      
      const abrirCerrarModalEditar=()=>{
        setModalEditar(!modalEditar);
      }
      
       const abrirCerrarModalEliminar=()=>{
        setModalEliminar(!modalEliminar);
      }
      const handleSearch=e=>{
        setSearchInput(e.target.value);
      }

      const filterSearch=(search)=>{
            return function(x){
                return (x.itemName.toString().toLowerCase().includes(search.toLowerCase()) || x.id.toString().toLowerCase().includes(search.toLowerCase()) ||  x.descripcion.toString().toLowerCase().includes(search.toLowerCase()) || x.familia.toString().toLowerCase().includes(search.toLowerCase()) || !search)
            }
        }
    

      const peticionGet=async()=>{
        await axios.get(baseUrl).then(response=>{
          setData(response.data);
          setTableData(response.data);
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
      
      const peticionPost=async()=>{
        delete productoSeleccionado.id;
        productoSeleccionado.price=parseInt(productoSeleccionado.price);
        await axios.post(baseUrl, productoSeleccionado)
        .then(response=>{
          setData(data.concat(response.data));
          abrirCerrarModalInsertar();
          MySwal.fire({
            title:'Insertado satisfactoriamente!',
            icon:'success',
            button:'Ok'
            })
        }).catch(error=>{
            MySwal.fire({
                title:'Error de Servidor',
                icon:'error',
                text:error,
                button:'Ok'
                })
          
        })
      }
      
      const peticionPut=async()=>{
        await axios.put(baseUrl+"/"+productoSeleccionado.id, productoSeleccionado)
        .then(response=>{
          var respuesta=response.data;
          var dataAuxiliar=data;
          dataAuxiliar.map(producto=>{
            if(producto.id===productoSeleccionado.id){
              producto.itemName=respuesta.itemName;
              producto.unidad = respuesta.unidad;
              producto.price = respuesta.price;
              producto.familia = respuesta.familia;
              producto.descripcion = respuesta.descripcion;
              producto.codSap = respuesta.codSap;
              }
            });
            abrirCerrarModalEditar();
            MySwal.fire({
              title:'Actualizado satisfactoriamente!',
              icon:'success',
              button:'Ok'
              })
          }).catch(error=>{
            MySwal.fire({
                title:'Error de Servidor',
                icon:'error',
                text:error,
                button:'Ok'
                })
          })
        }
      
        const peticionDelete=async()=>{
          await axios.delete(baseUrl+"/"+productoSeleccionado.id)
          .then(response=>{
           setData(data.filter(producto=>producto.id!==response.data));
            abrirCerrarModalEliminar();
            MySwal.fire({
              title:'Eliminado satisfactoriamente!',
              icon:'success',
              button:'Ok'
              })
          }).catch(error=>{
            console.log(error);
          })
        }
      

      const seleccionarProducto=(producto,caso)=>{
        setProductoSeleccionado(producto);
        (caso==="Editar")?
        abrirCerrarModalEditar(): abrirCerrarModalEliminar();
      }

    useEffect(()=>{
        if(role == undefined){
            window.location.href='./';
        }
        peticionGet();
    },[])

    return(
        <Sidebar>

      <div className="action-btn">
        <div class="input-group sm-7">
            <input type="text" class="form-control" onChange={handleSearch} value={searchInput} placeholder="Buscar" aria-label="Buscar" aria-describedby="basic-addon2" />
            <span class="input-group-text search btn-primary" id="basic-addon2"><i className="fa fa-search"></i></span>
        </div>  
      <button className = "btn btn btn-dark btn-new" onClick={()=>abrirCerrarModalInsertar()}> Nuevo insumo <i className="fa fa-plus-square"></i></button>
      </div>
      <table className="table table-striped">
        <thead className = "">
          <tr>
            <th>Codigo</th>
            <th>Código SAP</th>
            <th>Nombre</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Familia</th>
            <th>Alcance</th>
            <th>Acciones</th> 
          </tr>
        </thead>

        <tbody>
          {data && 
          data.filter(filterSearch(searchInput)).map(producto =>(
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.codSap}</td>
              <td>{producto.itemName}</td>
              <td>{producto.unidad}</td>
              <td>{formatter.format(producto.price.toFixed(2))}</td>
              <td>{producto.familia}</td>
              <td>{producto.descripcion}</td>
              
              <td>
              <button class="btn btn-success" title="Editar"onClick={()=>seleccionarProducto(producto, "Editar")}> <i class="fa-solid fa-edit"></i></button> {" "}
                <button class="btn btn-danger" title="Eliminar"onClick={()=>seleccionarProducto(producto, "Eliminar")}> <i class="fa-solid fa-trash"></i></button> {" "}
              </td>
            </tr>
          ))}
        </tbody>

      </table>

      <Modal isOpen = {modalInsertar} >
      <ModalHeader>Insertar nuevo insumo</ModalHeader>
      <ModalBody>
        <div className="form-group">
        <label>Codigo SAP: </label>
          <br />
          <input type="text" className="form-control" name="codSap" onChange={handleChange}/>
          <br />
          <label>Nombre: </label>
          <br />
          <input type="text" className="form-control" name="itemName" onChange={handleChange}/>
          <br />
          <label>Unidad: </label>
          <br />
          <input type="text" className="form-control" name="unidad"onChange={handleChange}/>
          <br />
          <label>Precio: </label>
          <br />
          <input type="text" className="form-control" name="price"onChange={handleChange}/>
          <br />
          <label>Familia: </label>
          <br />
          <input type="text" className="form-control" name="familia"onChange={handleChange}/>
          <br />
          <label>Alcance: </label>
          <br />
          <input type="text" className="form-control" name="descripcion"onChange={handleChange}/>
          <br />
         
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-success"onClick={()=>peticionPost()}>Insertar</button>{" "}
        <button className="btn btn-danger" onClick={()=>abrirCerrarModalInsertar()}>Cancelar</button>
      </ModalFooter>

   

    </Modal>

    <Modal isOpen = {modalEditar} >
      <ModalHeader> Editar insumo</ModalHeader>
      <ModalBody>
        <div className="form-group">
        <label> Codigo SAP: </label>
          <br />
          <input type="text" className="form-control" name="codSap" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.codSap} />
          <br />
          <label>Nombre: </label>
          <br />
          <input type="text" className="form-control" name="itemName" onChange={handleChange} value={productoSeleccionado && productoSeleccionado.itemName}/>
          <br />
          <label>Unidad: </label>
          <br />
          <input type="text" className="form-control" name="unidad"onChange={handleChange} value={productoSeleccionado && productoSeleccionado.unidad}/>
          <br />
          <label>Precio: </label>
          <br />
          <input type="text" className="form-control" name="price"onChange={handleChange} value={productoSeleccionado && productoSeleccionado.price}/>
          <br />
          <label>Familia: </label>
          <br />
          <input type="text" className="form-control" name="familia"onChange={handleChange} value={productoSeleccionado && productoSeleccionado.familia}/>
          <br />
          <label>Descripción: </label>
          <br />
          <input type="text" className="form-control" name="descripcion"onChange={handleChange} value={productoSeleccionado && productoSeleccionado.descripcion}/>
          <br />
          
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-primary" onClick={()=>peticionPut()} >Editar</button>{" "}
        <button className="btn btn-danger" onClick={()=>abrirCerrarModalEditar()}>Cancelar</button>
      </ModalFooter>
    </Modal>

    <Modal isOpen={modalEliminar}>
        <ModalBody>
           ¿Estás seguro que deseas eliminar el insumo (<b>{productoSeleccionado && productoSeleccionado.itemName}</b>)?
        </ModalBody>
        <ModalFooter>
          <button className="btn btn-danger" onClick={()=>peticionDelete()}>
            Sí
          </button>
          <button
            className="btn btn-secondary"
            onClick={()=>abrirCerrarModalEliminar()}>
            No
          </button>
        </ModalFooter>
      </Modal>

        </Sidebar>
    )
}

