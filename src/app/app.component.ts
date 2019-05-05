import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { timer, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

const fps = 30;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  private unsubscribe = new Subject<void>();

  ngAfterViewInit() {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.play();
    });
    let drawing = false;
    const width = this.video.nativeElement.width;
    const height = this.video.nativeElement.height;
    timer(undefined, 1000 / fps).pipe(
      takeUntil(this.unsubscribe),
      filter(() => !drawing), // Throw away ticks that occur while drawing
    ).subscribe(() => {
      drawing = true;
      const context = (this.canvas.nativeElement as HTMLCanvasElement).getContext('2d');
      context.drawImage(this.video.nativeElement, 0, 0, width, height);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(100, 100);
      context.lineWidth = 2;
      context.strokeStyle = '#F00';
      context.stroke();
      drawing = false;
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
