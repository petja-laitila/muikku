import * as React from "react";
import MathField from './better-math-field';
import { i18nType } from "~/reducers/base/i18n";

interface MathFieldProps {
  type: string,
  content: {
    name: string
  },
  i18n: i18nType
}

interface MathFieldState {
  value: string
}

export default class TextField extends React.Component<MathFieldProps, MathFieldState> {
  constructor(props: MathFieldProps){
    super(props);
    
    this.state = {
      value: 'AAAAAAAAAAA<span class="muikku-math-exercise-formula">\\frac{\\sum_{i=k}^n\\binom{n}{i}\\binom{m-n}{n-i}}{\\binom{m}{n}}</span>BBBBBBBBB'
    }
    
    this.setValue = this.setValue.bind(this);
  }
  setValue(newValue: string){
    console.log(newValue);
    this.setState({
      value: newValue
    });
  }
  render(){
    //NOTE you cannot change the formula class name unless you want to break backwards compatibility
    return <MathField className="muikku-math-exercise-field-editor"
      value={this.state.value} onChange={this.setValue}
      formulaClassName="muikku-math-exercise-formula"
      editorClassName="muikku-math-exercise-editor"
      toolbarClassName="muikku-math-exercise-toolbar" i18n={{
        basicsAndSymbols: this.props.i18n.text.get("plugin.workspace.mathField.basicsAndSymbols"),
        algebra: this.props.i18n.text.get("plugin.workspace.mathField.algebra"),
        geometryAndVectors: this.props.i18n.text.get("plugin.workspace.mathField.geometryAndVectors"),
        logic: this.props.i18n.text.get("plugin.workspace.mathField.logic"),
        moreMath: this.props.i18n.text.get("plugin.workspace.mathField.moreMath"),
        mathOperations: this.props.i18n.text.get("plugin.workspace.mathField.mathOperations"),
      }}/>
  }
}