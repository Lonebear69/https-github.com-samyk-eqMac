import { Component, ViewChild, ElementRef, AfterViewInit, Input, ChangeDetectionStrategy } from '@angular/core'
import { ColorsService } from '../../services/colors.service'

@Component({
  selector: 'eqm-loading',
  templateUrl: './loading.component.html',
  styleUrls: [ './loading.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent implements AfterViewInit {
  @ViewChild('wave', { static: true }) wave!: ElementRef
  @Input() text?: string
  @Input() showText = true

  constructor (
    public colors: ColorsService
  ) {}

  ngAfterViewInit () {
    const path = this.wave.nativeElement
    // eslint-disable-next-line no-loss-of-precision
    const m = 0.512286623256592433
    const w = 90
    const h = 60

    const a = h / 4
    const y = h / 2

    const pathData = [
      'M', w * 0, y + a / 2,
      'c', a * m, 0, -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a,
      's', -(1 - a) * m, a, a, a,
      's', -(1 - a) * m, -a, a, -a
    ].join(' ')

    path.setAttribute('d', pathData)
  }
}
