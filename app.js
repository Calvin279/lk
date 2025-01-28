class ControlHoras {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registros')) || [];
        this.inicializarEventos();
        this.renderizarTabla();
        this.renderizarResumenSemanal();
    }

    inicializarEventos() {
        const form = document.getElementById('hoursForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarHoras();
        });
    }

    registrarHoras() {
        const nombre = document.getElementById('nombre').value;
        const rango = document.getElementById('rango').value;
        const fecha = document.getElementById('fecha').value;
        const horaEntrada = document.getElementById('horaEntrada').value;
        const horaSalida = document.getElementById('horaSalida').value;

        const tiempoTrabajado = this.calcularTiempoTrabajado(horaEntrada, horaSalida);
        const estado = tiempoTrabajado >= 3 ? '✅' : '❌';

        const registro = {
            nombre, 
            rango, 
            fecha, 
            horaEntrada, 
            horaSalida, 
            tiempoTrabajado,
            estado
        };

        this.registros.push(registro);
        this.guardarRegistros();
        this.renderizarTabla();
        this.renderizarResumenSemanal();

        if (tiempoTrabajado < 3) {
            this.mostrarNotificacion(`${nombre} no cumplió con las 3 horas mínimas`);
        }

        // Limpiar formulario
        document.getElementById('hoursForm').reset();
    }

    calcularTiempoTrabajado(entrada, salida) {
        const [horaEntrada, minEntrada] = entrada.split(':').map(Number);
        const [horaSalida, minSalida] = salida.split(':').map(Number);

        let totalHoras = horaSalida - horaEntrada;
        let totalMinutos = minSalida - minEntrada;

        if (totalMinutos < 0) {
            totalHoras--;
            totalMinutos += 60;
        }

        return totalHoras + (totalMinutos / 60);
    }

    renderizarTabla() {
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = '';

        this.registros.forEach(registro => {
            const fila = document.createElement('tr');
            fila.classList.add(registro.tiempoTrabajado >= 3 ? 'cumplido' : 'incumplido');
            fila.innerHTML = `
                <td>${registro.nombre}</td>
                <td>${registro.rango}</td>
                <td>${registro.fecha}</td>
                <td>${registro.horaEntrada}</td>
                <td>${registro.horaSalida}</td>
                <td>${registro.tiempoTrabajado.toFixed(2)} hrs</td>
                <td>${registro.estado}</td>
            `;
            tableBody.appendChild(fila);
        });
    }

    renderizarResumenSemanal() {
        const resumenBody = document.getElementById('resumenBody');
        resumenBody.innerHTML = '';

        const resumenPorEmpleado = this.calcularResumenSemanal();

        resumenPorEmpleado.forEach(empleado => {
            const fila = document.createElement('tr');
            const cumplioHoras = empleado.horasTotales >= 28;
            fila.classList.add(cumplioHoras ? 'cumplido' : 'incumplido');
            fila.innerHTML = `
                <td>${empleado.nombre}</td>
                <td>${empleado.horasTotales.toFixed(2)} hrs</td>
                <td>${cumplioHoras ? '😊' : '😞'}</td>
            `;
            resumenBody.appendChild(fila);
        });
    }

    calcularResumenSemanal() {
        const resumenPorEmpleado = {};

        this.registros.forEach(registro => {
            if (!resumenPorEmpleado[registro.nombre]) {
                resumenPorEmpleado[registro.nombre] = 0;
            }
            resumenPorEmpleado[registro.nombre] += registro.tiempoTrabajado;
        });

        return Object.entries(resumenPorEmpleado).map(([nombre, horasTotales]) => ({
            nombre,
            horasTotales
        }));
    }

    buscarEmpleado() {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        const tableBody = document.getElementById('tableBody');
        const filas = tableBody.getElementsByTagName('tr');

        for (let fila of filas) {
            const nombreCelda = fila.getElementsByTagName('td')[0];
            if (nombreCelda) {
                const nombreTexto = nombreCelda.textContent.toLowerCase();
                fila.style.display = nombreTexto.includes(searchInput) ? '' : 'none';
            }
        }
    }

    mostrarNotificacion(mensaje) {
        const notificacion = document.getElementById('notificacion');
        notificacion.textContent = mensaje;
        notificacion.style.display = 'block';
        setTimeout(() => {
            notificacion.style.display = 'none';
        }, 3000);
    }

    guardarRegistros() {
        localStorage.setItem('registros', JSON.stringify(this.registros));
    }
}

// Inicializar la aplicación
window.addEventListener('DOMContentLoaded', () => {
    const controlHoras = new ControlHoras();
    window.buscarEmpleado = () => controlHoras.buscarEmpleado();
});