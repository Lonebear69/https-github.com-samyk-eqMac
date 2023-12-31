import { ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { CheckboxOption, ButtonOption, Options, SelectOption, DividerOption, FlatSliderOption, LabelOption, ValueScreenOption } from 'src/app/components/options/options.component'
import { SettingsService, IconMode } from './settings.service'
import { ApplicationService } from '../../services/app.service'
import { MatDialog } from '@angular/material/dialog'
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component'
import { StatusItemIconType, UIService } from '../../services/ui.service'
import { AnalyticsService } from '../../services/analytics.service'
import { SemanticVersion } from '../../services/semantic-version.service'
import { OptionsDialogComponent } from '../../components/options-dialog/options-dialog.component'
import { KnobControlStyle } from '../../../../../modules/components/src'

@Component({
  selector: 'eqm-settings',
  templateUrl: './settings.component.html',
  styleUrls: [ './settings.component.scss' ]
})
export class SettingsComponent implements OnInit {
  launchOnStartupOption: CheckboxOption = {
    type: 'checkbox',
    label: 'Launch on login',
    value: false,
    toggled: launchOnStartup => this.settingsService.setLaunchOnStartup(launchOnStartup)
  }

  replaceKnobsWithSlidersOption: CheckboxOption = {
    type: 'checkbox',
    label: 'Knobs → Sliders',
    value: false,
    toggled: replaceKnobsWithSliders => {
      this.ui.setSettings({ replaceKnobsWithSliders })
      this.app.ref.closeDropdownSection('settings')
    }
  }

  knobControlStyleOption: SelectOption<KnobControlStyle> = {
    type: 'select',
    label: 'Knob Control',
    options: [ {
      id: 'directional',
      icon: 'move'
    }, {
      id: 'rotational',
      icon: 'refresh'
    } ],
    selectedId: 'directional',
    selected: knobControlStyle => {
      this.ui.setSettings({ knobControlStyle })
    }
  }

  alwaysOnTopOption: CheckboxOption = {
    type: 'checkbox',
    label: 'Always on top',
    value: false,
    toggled: alwaysOnTop => {
      this.ui.setAlwaysOnTop({ alwaysOnTop })
    }
  }

  doCollectTelemetryOption: CheckboxOption = {
    type: 'checkbox',
    label: 'Send Analytics telemetry',
    tooltip: `
eqMac would collect anonymous Telemetry analytics data like:

• macOS Version
• App and UI Version
• Country (IP Addresses are anonymized)

This helps us understand distribution of our users.
`,
    value: false,
    toggled: doCollectTelemetry => {
      this.ui.setSettings({ doCollectTelemetry })
      if (doCollectTelemetry) {
        this.analytics.init()
      } else {
        this.analytics.deinit()
      }
    }
  }

  doCollectCrashReportsOption: CheckboxOption = {
    type: 'checkbox',
    label: 'Send Crash reports',
    tooltip: `
eqMac would send anonymized crash reports
back to the developer in case eqMac crashes.
This helps us understand improve eqMac 
and make it a more stable product.
`,
    value: false,
    toggled: doCollectCrashReports => {
      this.settingsService.setDoCollectCrashReports({
        doCollectCrashReports
      })
    }
  }

  iconModeOption: SelectOption = {
    type: 'select',
    label: 'Show Icon',
    options: [ {
      id: IconMode.dock,
      label: 'Dock'
    }, {
      id: IconMode.both,
      label: 'Both'
    }, {
      id: IconMode.statusBar,
      label: 'Status Bar'
    }, {
      id: IconMode.neither,
      label: 'Neither'
    } ],
    selectedId: IconMode.both,
    selected: async iconMode => {
      const uiMode = await this.ui.getMode()
      if (iconMode === IconMode.dock && uiMode === 'popover') {
        await this.ui.setMode('window')
      }
      await this.settingsService.setIconMode(iconMode as IconMode)
    }
  }

  uninstallOption: ButtonOption = {
    type: 'button',
    label: 'Uninstall eqMac',
    hoverable: false,
    action: this.uninstall.bind(this)
  }

  updateOption: ButtonOption = {
    type: 'button',
    label: 'Check for Updates',
    action: this.update.bind(this)
  }

  autoCheckUpdatesOption: CheckboxOption = {
    type: 'checkbox',
    value: false,
    label: 'Auto Check',
    toggled: doAutoCheckUpdates => {
      this.settingsService.setDoAutoCheckUpdates({
        doAutoCheckUpdates
      })
    }
  }

  otaUpdatesOption: CheckboxOption = {
    type: 'checkbox',
    value: false,
    label: 'OTA Updates',
    tooltip: `
Because eqMac's User Interface is built with Web Technologies 
the developer can periodically push Over the Air (OTA) updates,
make minor bug fixes and UI improvements,
all without needing the user to do a full app update.
`,
    tooltipAsComponent: false,
    toggled: doOTAUpdates => {
      this.settingsService.setDoOTAUpdates({
        doOTAUpdates
      })
    }
  }

  betaUpdatesOption: CheckboxOption = {
    type: 'checkbox',
    value: false,
    label: 'Beta Program',
    tooltip: `
Get and test the most latest changes to eqMac.
Help the developer identify and fix uncaught issues, 
before they go out to all users.
`,
    toggled: doBetaUpdates => {
      this.settingsService.setDoBetaUpdates({
        doBetaUpdates
      })
    }
  }

  statusItemIconTypeOption: SelectOption = {
    type: 'select',
    label: 'Status Icon Type',
    isEnabled: () => ([ IconMode.both, IconMode.statusBar ] as IconMode[]).includes(this.iconModeOption.selectedId as any),
    options: [ {
      id: StatusItemIconType.classic,
      label: 'Classic'
    }, {
      id: StatusItemIconType.colored,
      label: 'Colored'
    }, {
      id: StatusItemIconType.macOS,
      label: 'macOS'
    } ],
    selectedId: StatusItemIconType.classic,
    selected: async (statusItemIconType: StatusItemIconType) => {
      await this.ui.setStatusItemIconType(statusItemIconType)
    }
  }

  uiScaleLabel: LabelOption = {
    type: 'label',
    label: 'UI Scale'
  }

  setUIScaleScreenValue () {
    this.uiScaleScreen.value = `${Math.round(this.uiScaleSlider.value * 100)}%`
  }

  uiScaleSliderDebounceTimer: number
  uiScaleSlider: FlatSliderOption = {
    type: 'flat-slider',
    value: 1,
    min: 0.5,
    max: 2,
    orientation: 'horizontal',
    doubleClickToAnimateToMiddle: false,
    middle: 1,
    stickToMiddle: true,
    showMiddleNotch: true,
    scrollEnabled: false,
    userChangedValue: event => {
      this.setUIScaleScreenValue()
      this.changeRef.detectChanges()
      if (this.uiScaleSliderDebounceTimer) {
        clearTimeout(this.uiScaleSliderDebounceTimer)
      }
      this.uiScaleSliderDebounceTimer = setTimeout(() => {
        this.ui.setScale(event.value)
      }, 1000) as any
    },
    style: {
      width: '700px'
    }
  }

  uiScaleScreen: ValueScreenOption = {
    type: 'value-screen',
    value: '100%'
  }

  hideShowFeaturesOption: ButtonOption = {
    type: 'button',
    label: 'Show/Hide Features',
    action: async () => {
      const uiSettings = await this.ui.getSettings()
      const volume: CheckboxOption = {
        type: 'checkbox',
        label: 'Volume',
        value: uiSettings.volumeFeatureEnabled ?? true,
        toggled: volumeFeatureEnabled => {
          this.ui.setSettings({ volumeFeatureEnabled })
        }
      }

      const balance: CheckboxOption = {
        type: 'checkbox',
        label: 'Balance',
        value: uiSettings.balanceFeatureEnabled ?? true,
        toggled: balanceFeatureEnabled => {
          this.ui.setSettings({ balanceFeatureEnabled })
        }
      }

      const equalizers: CheckboxOption = {
        type: 'checkbox',
        label: 'Equalizers',
        value: uiSettings.equalizersFeatureEnabled ?? true,
        toggled: equalizersFeatureEnabled => {
          this.ui.setSettings({ equalizersFeatureEnabled })
        }
      }

      const output: CheckboxOption = {
        type: 'checkbox',
        label: 'Output',
        value: uiSettings.outputFeatureEnabled ?? true,
        toggled: outputFeatureEnabled => {
          this.ui.setSettings({ outputFeatureEnabled })
        }
      }
      const options: Options = [
        [ volume, balance ],
        [ this.divider ],
        [ equalizers ],
        [ this.divider ],
        [ output ]
      ]

      await this.dialog.open(OptionsDialogComponent, {
        hasBackdrop: true,
        disableClose: false,
        data: {
          options
        }
      })
    }
  }

  private readonly divider: DividerOption = { type: 'divider', orientation: 'horizontal' }
  settings: Options = [
    [ this.uiScaleLabel, this.uiScaleSlider, this.uiScaleScreen ],
    [ this.iconModeOption ],
    [ this.statusItemIconTypeOption ],
    [
      this.launchOnStartupOption,
      this.alwaysOnTopOption
    ],
    [
      this.replaceKnobsWithSlidersOption,
      this.knobControlStyleOption
    ],
    [ this.hideShowFeaturesOption ],

    [ this.divider ],

    [ { type: 'label', label: 'Updates' } ],
    [
      this.betaUpdatesOption,
      this.autoCheckUpdatesOption,
      this.otaUpdatesOption
    ],
    [
      this.updateOption
    ],

    [ this.divider ],

    // Privacy
    [ { type: 'label', label: 'Privacy' } ],
    [
      this.doCollectTelemetryOption,
      this.doCollectCrashReportsOption
    ],

    [ this.divider ],
    // Misc
    [ this.uninstallOption ]
  ]

  constructor (
    public settingsService: SettingsService,
    public app: ApplicationService,
    public dialog: MatDialog,
    public ui: UIService,
    public analytics: AnalyticsService,
    private readonly changeRef: ChangeDetectorRef
  ) {
  }

  ngOnInit () {
    this.sync()
  }

  async sync () {
    await Promise.all([
      this.syncSettings()
    ])
  }

  async syncSettings () {
    const [
      launchOnStartup,
      iconMode,
      UISettings,
      doCollectCrashReports,
      doAutoCheckUpdates,
      doOTAUpdates,
      alwaytOnTop,
      statusItemIconType,
      doBetaUpdates,
      uiScale
    ] = await Promise.all([
      this.settingsService.getLaunchOnStartup(),
      this.settingsService.getIconMode(),
      this.ui.getSettings(),
      this.settingsService.getDoCollectCrashReports(),
      this.settingsService.getDoAutoCheckUpdates(),
      this.settingsService.getDoOTAUpdates(),
      this.ui.getAlwaysOnTop(),
      this.ui.getStatusItemIconType(),
      this.settingsService.getDoBetaUpdates(),
      this.ui.getScale()
    ])
    this.iconModeOption.selectedId = iconMode
    this.launchOnStartupOption.value = launchOnStartup
    this.replaceKnobsWithSlidersOption.value = UISettings.replaceKnobsWithSliders
    this.knobControlStyleOption.selectedId = UISettings.knobControlStyle
    this.doCollectTelemetryOption.value = UISettings.doCollectTelemetry
    this.doCollectCrashReportsOption.value = doCollectCrashReports
    this.autoCheckUpdatesOption.value = doAutoCheckUpdates
    this.otaUpdatesOption.value = doOTAUpdates
    this.alwaysOnTopOption.value = alwaytOnTop
    this.statusItemIconTypeOption.selectedId = statusItemIconType
    this.betaUpdatesOption.value = doBetaUpdates
    this.uiScaleSlider.value = uiScale
    this.setUIScaleScreenValue()
  }

  async update () {
    this.app.update()
  }

  async uninstall () {
    this.app.uninstall()
  }
}
