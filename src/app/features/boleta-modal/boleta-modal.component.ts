import { CommonModule } from "@angular/common";
import { Component, effect, EventEmitter, inject, Input, OnInit, Output, signal } from "@angular/core";
import { PlanillaMensualService } from "../../core/services/planilla-mensual.service";
import { PlanillaPorDocumentoDTO } from "../../shared/models/planilla-por-documento-dto";
import { catchError, finalize, of } from "rxjs";

@Component({
  selector: 'app-boleta-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boleta-modal.component.html',
  styleUrls: ['./boleta-modal.component.css']
})
export class BoletaModalComponent implements OnInit {
  private planillaService = inject(PlanillaMensualService);

  @Input() set anio(value: number) { this.anioSignal.set(value); }
  @Input() set mes(value: number) { this.mesSignal.set(value); }
  @Input() set documento(value: string) { this.documentoSignal.set(value); }
  @Input() set trabajador(value: any) { this.trabajadorSignal.set(value); }
  
  @Output() close = new EventEmitter<void>();

  // Signals para estado reactivo
  anioSignal = signal<number>(0);
  mesSignal = signal<number>(0);
  documentoSignal = signal<string>('');
  trabajadorSignal = signal<any>(null);
  
  boletaData = signal<PlanillaPorDocumentoDTO | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor() {
    // Efecto que se ejecuta cuando cambian los inputs
    effect(() => {
      const anio = this.anioSignal();
      const mes = this.mesSignal();
      const documento = this.documentoSignal();
      
      if (anio && mes && documento) {
        this.cargarBoleta();
      }
    });
  }

  ngOnInit() {
    // Cargar automáticamente si ya tenemos los datos
    if (this.anioSignal() && this.mesSignal() && this.documentoSignal()) {
      this.cargarBoleta();
    }
  }

  cargarBoleta() {
    const anio = this.anioSignal();
    const mes = this.mesSignal();
    const documento = this.documentoSignal();

    if (!documento) {
      this.error.set('No se ha proporcionado un documento válido.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.planillaService.obtenerPlanillaPorDocumento(anio, mes, documento)
      .pipe(
        catchError(err => {
          console.error('Error al cargar boleta:', err);
          this.error.set(err.message || 'Error al cargar la boleta. Intente nuevamente.');
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(data => {
        if (data) {
          this.boletaData.set(data);
        }
      });
  }

  descargarBoleta() {
    const boletaData = this.boletaData();
    const trabajador = this.trabajadorSignal();
    
    if (!boletaData || !trabajador) return;
    
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(this.generarHTMLBoleta());
      ventana.document.close();
      
      ventana.onload = () => {
        ventana.print();
      };
    }
  }

  private generarHTMLBoleta(): string {
    const boletaData = this.boletaData();
    const trabajador = this.trabajadorSignal();
    
    if (!boletaData || !trabajador) return '';
    
    const mesNombre = this.obtenerNombreMes(this.mesSignal());
    const nombreCompleto = `${trabajador.nombres || ''} ${trabajador.apellidoPaterno || ''} ${trabajador.apellidoMaterno || ''}`.trim();
    
    return `
    <!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Boleta de Pago</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; font-size: 14px; }
            .boleta { width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            header h1 { font-size: 20px; color: #0046ad; margin: 0; }
            header h1 span { color: orange; }
            .empresa-info p, .trabajador-info p { margin: 5px 0; }
            .empresa-logo { text-align: center; }
            .empresa-logo img { width: 100px; height: auto; }
            .trabajador-info, .detalles, .resumen { margin-top: 15px; }
            .detalles { display: flex; justify-content: space-between; gap: 10px; }
            .detalles div { flex: 1; }
            .detalles h3 { background-color: #f0f0f0; padding: 5px; margin: 0 0 10px 0; text-align: center; }
            .detalles table { width: 100%; border-collapse: collapse; }
            .detalles table td { padding: 4px; border-bottom: 1px solid #ccc; }
            .detalles table tr:last-child td { border-bottom: 2px solid #000; font-weight: bold; }
            footer { text-align: center; margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; }
            @media print {
                body { margin: 0; }
                .boleta { border: none; width: 100%; padding: 10px; }
            }
        </style>
    </head>
    <body>
        <div class='boleta'>
            <header>
                <div class='empresa-info'>
                    <h1>BOLETA DE PAGO <span>${mesNombre}/${boletaData.anio}</span></h1>
                    <p><strong>Razón Social:</strong> Nombre Empresa Contratada</p>
                    <p><strong>Dirección:</strong> Direccion Empresa Contratada</p>
                    <p><strong>NIT:</strong> 25263987456 &nbsp; <strong>Reg. Patronal:</strong> 070710-00156</p>
                </div>
                <div class='empresa-logo'>
                    <div style="width: 100px; height: 60px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                        [LOGO]
                    </div>
                    <p>D.S. N° 001-98-TR del 22/01/1998</p>
                </div>
            </header>

            <section class='trabajador-info'>
                <h2>Trabajador</h2>
                <p><strong>Trabajador:</strong> ${this.documentoSignal()} - ${nombreCompleto}</p>
                <p><strong>Fecha Ingreso:</strong> ${this.formatDate(trabajador.fecIngreso)}</p>
                <p><strong>Cargo:</strong> ${trabajador.cargo?.nombre || 'N/A'}</p>
                <p><strong>Días Trab.:</strong> ${boletaData.ndiasTrab} &nbsp; <strong>Horas:</strong> ${boletaData.nhorasNormal}</p>
            </section>

            <section class='detalles'>
                <div class='ingresos'>
                    <h3>Ingresos</h3>
                    <table>
                        <tr><td>Rem. Básico</td><td style="text-align: right;">S/ ${boletaData.haberBasico?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Asig. Familiar</td><td style="text-align: right;">S/ ${boletaData.vasigFamiliar?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Horas Extras 25%</td><td style="text-align: right;">S/ ${boletaData.vhorasExtra1?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Horas Extras 35%</td><td style="text-align: right;">S/ ${boletaData.vhorasExtra2?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Dias Feriados</td><td style="text-align: right;">S/ ${boletaData.vferiadoTrab?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Vales</td><td style="text-align: right;">S/ ${boletaData.valesEmpleado?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Bonificación Cargo</td><td style="text-align: right;">S/ ${boletaData.bonificacionCargo?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Total Ingresos</td><td style="text-align: right;"><strong>S/ ${boletaData.totalIngreso?.toFixed(2) || '0.00'}</strong></td></tr>
                    </table>
                </div>
                
                <div class='descuentos'>
                    <h3>Descuentos de Ley</h3>
                    <table>
                        <tr><td>Aporte</td><td style="text-align: right;">S/ ${boletaData.aporte?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Comision</td><td style="text-align: right;">S/ ${boletaData.comision?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Prima</td><td style="text-align: right;">S/ ${boletaData.prima?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Total Descuentos</td><td style="text-align: right;"><strong>S/ ${boletaData.totalDescuento?.toFixed(2) || '0.00'}</strong></td></tr>
                    </table>
                </div>

                <div class='aportes'>
                    <h3>Aportes del Empleador</h3>
                    <table>
                        <tr><td>ESSALUD</td><td style="text-align: right;">S/ ${boletaData.esSalud?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Seguro Vida Ley</td><td style="text-align: right;">S/ ${boletaData.seguroVidaLey?.toFixed(2) || '0.00'}</td></tr>
                        <tr><td>Total Empleador</td><td style="text-align: right;"><strong>S/ ${((boletaData.esSalud || 0) + (boletaData.seguroVidaLey || 0)).toFixed(2)}</strong></td></tr>
                    </table>
                </div>
            </section>

            <section class='resumen'>
                <div class='neto'>
                    <h3>Resumen</h3>
                    <p><strong>Neto a Pagar:</strong> S/ ${boletaData.totalNetoBoleta?.toFixed(2) || '0.00'}</p>
                    <p><strong>Son:</strong> ${boletaData.totalNetoBoletaCad || ''}</p>
                </div>
            </section>

            <footer>
                <p><strong>Emp. Nombre de Sistema</strong></p>
                <p>Recibí Conforme: <span>____________</span> DNI: <span>____________</span></p>
            </footer>
        </div>
    </body>
    </html>`;
  }

  private obtenerNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1] || '';
  }

  private formatDate(date: any): string {
    if (!date) return 'N/A';
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-ES');
    } catch {
      return 'N/A';
    }
  }

  onClose() {
    this.close.emit();
  }

  retry() {
    this.error.set(null);
    this.cargarBoleta();
  }
}