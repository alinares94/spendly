import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Initialize Vercel Analytics
    import('@vercel/analytics').then(({ inject: injectAnalytics }) => {
      injectAnalytics();
    });
    // Initialize Vercel Speed Insights
    import('@vercel/speed-insights').then(({ injectSpeedInsights }) => {
      injectSpeedInsights();
    });
  })
  .catch((err) => console.error(err));
