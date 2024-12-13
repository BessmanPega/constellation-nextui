// Statically load all "local" components that aren't yet in the npm package
import AutoComplete from './src/components/AutoComplete'
import Dropdown from './src/components/Dropdown'
import Email from './src/components/Email'
import Phone from './src/components/Phone'
import TextInput from './src/components/TextInput'
/*import end - DO NOT REMOVE*/

// localSdkComponentMap is the JSON object where we store the components that are
// found locally. If not found here, look in the Pega-provided component map.

const localSdkComponentMap = {
    AutoComplete: AutoComplete,
    Dropdown: Dropdown,
    Email: Email,
    Phone: Phone,
    TextInput: TextInput,
    /*map end - DO NOT REMOVE*/
 };
 
 export default localSdkComponentMap;
 