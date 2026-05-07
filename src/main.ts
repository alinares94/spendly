import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Initialize Vercel Analytics
    import('@vercel/analytics').then(({ inject: injectAnalytics }) => {
      injectAnalytics();
    });
  })
  .catch((err) => console.error(err));
