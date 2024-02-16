import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, inject} from '@angular/core';
import { GlobalFunctionsService } from 'app/services/global-functions.service';
import { GlobalVariablesService } from 'app/services/global-variables.service';

@Component({
  selector: 'app-add-new-channel',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './add-new-channel.component.html',
  styleUrl: './add-new-channel.component.scss'
})
export class AddNewChannelComponent {

  globalVariables = inject (GlobalVariablesService);
  globalFunctions = inject (GlobalFunctionsService);
  

}
