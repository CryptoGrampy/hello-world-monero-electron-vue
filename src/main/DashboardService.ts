import ElectronStore from "electron-store";
import { BehaviorSubject, Observable } from "rxjs";

export interface MonerodTimer {
  onTime?: string
  offTime?: string
}

interface DashboardStore {
  dashboardStore: {
    timer?: MonerodTimer
  }
}

export class DashboardService {
  private readonly store = new ElectronStore<DashboardStore>()
  private readonly timerSubject: BehaviorSubject<MonerodTimer> = new BehaviorSubject(this.getTimer());
  public get timer$(): Observable<MonerodTimer> {
    return this.timerSubject.asObservable()
}


  // Retrieves timer from electron-store
  private getTimer(): MonerodTimer {
      return this.store.get('dashboardStore.timer')
  }

  public setTimer(timer: MonerodTimer): void {
    this.store.set('dashboardStore.timer', timer)
    this.timerSubject.next(timer)
  }
}