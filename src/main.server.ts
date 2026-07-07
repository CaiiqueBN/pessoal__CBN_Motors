import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // Ensure your import is correct
import { config } from './app/app.config.server';

// Update the bootstrap function to accept 'context' and pass it to bootstrapApplication
const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;