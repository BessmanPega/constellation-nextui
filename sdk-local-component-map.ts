// Statically load all "local" components that aren't yet in the npm package
import ActionButtons from './src/components/ActionButtons'
import AutoComplete from './src/components/AutoComplete'
import Date from './src/components/Date'
import Dropdown from './src/components/Dropdown'
import Email from './src/components/Email'
import MultiStep from './src/components/MultiStep'
import Phone from './src/components/Phone'
import RadioButtons from './src/components/RadioButtons'
import TextInput from './src/components/TextInput'
/*import end - DO NOT REMOVE*/

// localSdkComponentMap is the JSON object where we store the components that are
// found locally. If not found here, look in the Pega-provided component map.

const localSdkComponentMap = {
    ActionButtons: ActionButtons,
    AutoComplete: AutoComplete,
    Date: Date,
    Dropdown: Dropdown,
    Email: Email,
    MultiStep: MultiStep,
    Phone: Phone,
    RadioButtons: RadioButtons,
    TextInput: TextInput,
    /*map end - DO NOT REMOVE*/
 };
 
 export default localSdkComponentMap;
 