var alertPlaceholder = document.getElementById('liveAlertPlaceholder')
var alertTrigger = document.getElementById('liveAlertBtn')

function alert(message, type) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'

    alertPlaceholder.append(wrapper)
}

if (alertTrigger) {
    alertTrigger.addEventListener('click', function () {
    alert('Te has suscripto exitosamente!', 'success')
    })
}

Vue.createApp({
    data(){
        return{
            datos: [],
            juguetes: [],
            farmacia:[],
            productos_carrito:[],
            productos:[],
            contador:0,
            subtotalProducto:0,
            subtotalTotal:0,
            productosEnStorage:[],
            productosNuevo:[],
            opcionOrdenar:'all',
            aux:[],
        }
    },
    created(){
        fetch('https://apipetshop.herokuapp.com/api/articulos')
            .then(responde => responde.json())
                .then(data => {
                this.productos = data.response
                this.datos = this.productos.map(producto=>{
                    let productoNuevo = {
                        _id:producto._id,
                        nombre:producto.nombre,
                        descripcion:producto.descripcion,
                        precio:producto.precio,
                        stock:producto.stock,
                        imagen:producto.imagen,
                        tipo:producto.tipo,
                        __v:producto.__v,
                        cantidad:0
                    }
                    return productoNuevo
                })
                this.productosEnStorage = JSON.parse(localStorage.getItem("carrito"))
                if(this.productosEnStorage ){
                    this.productos_carrito = this.productosEnStorage
                    this.productosEnStorage.forEach(producto => {
                        this.subtotalProducto = producto.precio * producto.__v
                        this.subtotalTotal += this.subtotalProducto // <3
                    });              
                }
            })

    },
    methods:{

        modal_contacto(){
            let formulario = document.getElementById("form")
        
            formulario.reset()
        },

        limiteCantidadMas(tarjeta){
            let boton =  document.querySelector(".stock2")

            if(tarjeta.cantidad < tarjeta.stock)
            {
                tarjeta.cantidad++
                boton.disabled = false
            }

            else if(tarjeta.cantidad > tarjeta.stock)
            {
            boton.disabled= true
            }
        },

        limiteCantidadMenos(tarjeta){
            let boton =  document.querySelector(".stock1")

                if(tarjeta.cantidad > 0)
                {
                    tarjeta.cantidad--
                    boton.disabled = false
                }


            else if(tarjeta.cantidad < 0)
            {
                boton.disabled = true
            }

            
        },


        subtotalIndividual(tarjeta)
        {

            let subtotalProducto = 0
           subtotalProducto = tarjeta.precio * tarjeta.__v

            this.subtotalProducto = subtotalProducto
            return this.subtotalProducto
        },

        añadirAlCarrito(tarjeta){
            let aux = tarjeta.stock    //10   //8   //7
            tarjeta.__v += tarjeta.cantidad // 0 + 2  // 2 + 1 = 3

            if(this.productos_carrito.includes(tarjeta) )
            {
                tarjeta.stock = aux - tarjeta.cantidad
                this.subtotalTotal += tarjeta.precio*tarjeta.cantidad// 0 + 480   // 
                localStorage.setItem("carrito",JSON.stringify(this.productos_carrito))
            }
            
            else if(!this.productos_carrito.includes(tarjeta) )
            {
                this.productos_carrito.push(tarjeta)
                localStorage.setItem("carrito",JSON.stringify(this.productos_carrito))
                tarjeta.stock = aux - tarjeta.__v // 8 
                this.subtotalProducto = tarjeta.precio * tarjeta.__v //precio * __v 240 * 2
                this.subtotalTotal += this.subtotalProducto // 0 + 480   // 
            }

            tarjeta.cantidad = 0
        },

        quitarProductoCarrito(tarjeta){
            this.productos_carrito = this.productos_carrito.filter(tarj => tarj._id !== tarjeta._id)
            this.productosEnStorage = this.productos_carrito    
            localStorage.setItem("carrito",JSON.stringify(this.productos_carrito))
            
            this.subtotalProducto = tarjeta.precio * tarjeta.__v
            
            this.subtotalTotal -= this.subtotalProducto

            tarjeta.stock += tarjeta.__v
            tarjeta.__v = 0

            if(this.productos_carrito.length == 00)
            {
                this.subtotalTotal = 0
            }
        },


    },
    computed:{
        renderTarjetasJuguetes(){
            this.juguetes = this.datos.filter(dato => dato.tipo == "Juguete")
            
        },
        renderTarjetasFarmacia(){
            this.farmacia = this.datos.filter(dato => dato.tipo == "Medicamento")
        },

        ordenarPor(){
            let ordenarMenor = []
            let ordenarMayor = []
            let ordenarAZ = []
            let ordenarZA = []
            if (this.datos.tipo == "Juguete"){
                this.aux = this.juguetes.map(tarjeta => tarjeta)
            } else if (this.datos.tipo == "Medicamento"){
                this.aux = this.farmacia.map(tarjeta => tarjeta)
            }

            if (this.opcionOrdenar == "all" ){
                this.aux = !this.juguetes.length == 0? this.juguetes : this.farmacia
            } else if (this.opcionOrdenar == "menorPrecio"){
                ordenarMenor = this.aux.filter(tarjeta => tarjeta.precio).sort(function(a,b) {return a.precio - b.precio})
                this.aux = ordenarMenor
            } else if (this.opcionOrdenar == "mayorPrecio"){
                ordenarMayor = this.aux.filter(tarjeta => tarjeta.precio).sort(function(a,b) {return b.precio - a.precio})
                this.aux = ordenarMayor
            } else if (this.opcionOrdenar == "az"){
                ordenarAZ = this.aux.filter(tarjeta => tarjeta.nombre).sort(function(a,b) {
                    return a.nombre.localeCompare(b.nombre)
                })
                this.aux = ordenarAZ
            } else if (this.opcionOrdenar == "za"){
                ordenarZA = this.aux.filter(tarjeta => tarjeta.nombre).sort(function(a,b) {
                    return b.nombre.localeCompare(a.nombre)
                })
                this.aux = ordenarZA
            }
        },
    }
}).mount('#app')