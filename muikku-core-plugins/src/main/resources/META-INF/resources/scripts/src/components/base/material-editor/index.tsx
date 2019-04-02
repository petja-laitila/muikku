import * as React from 'react';
import Portal from '~/components/general/portal';

import '~/sass/elements/material-editor.scss';
import { bindActionCreators } from 'redux';
import { setWorkspaceMaterialEditorState, SetWorkspaceMaterialEditorStateTriggerType } from '~/actions/workspaces';
import { connect, Dispatch } from 'react-redux';
import { StateType } from '~/reducers';
import { i18nType } from '~/reducers/base/i18n';
import { WorkspaceMaterialEditorType, WorkspaceType, MaterialContentNodeType } from "~/reducers/workspaces";
import { ButtonPill } from '~/components/general/button';
import CKEditor from '~/components/general/ckeditor';
import { StatusType } from '~/reducers/base/status';
import { LocaleListType } from '~/reducers/base/locales';

interface MaterialEditorProps {
  setWorkspaceMaterialEditorState: SetWorkspaceMaterialEditorStateTriggerType,
  i18n: i18nType,
  status: StatusType,
  editorState: WorkspaceMaterialEditorType,
  locale: LocaleListType,
}

interface MaterialEditorState {
  visible: boolean
}

const CKEditorConfig = (
    locale: string,
    contextPath: string,
    workspace: WorkspaceType,
    materialNode: MaterialContentNodeType
) => ({
  uploadUrl: `/materialAttachmentUploadServlet/workspace/${workspace.urlName}/${materialNode.path}`,
  autoGrowOnStartup : true,
  autoGrow_minHeight: 400,
  linkShowTargetTab: true,
  allowedContent: true, // disable content filtering to preserve all formatting of imported documents; fix for #263
  entities: false,
  entities_latin: false,
  entities_greek: false,
  skin : 'moono',
  height : 500,
  language: locale,
  stylesSet : 'workspace-material-styles:' + contextPath + '/scripts/ckplugins/styles/workspace-material-styles.js',
  contentsCss : contextPath +  '/css/deprecated/custom-ckeditor-contentcss.css',
  format_tags : 'p;h3;h4',
  baseHref: `workspace/${workspace.urlName}/${materialNode.path}/`, 
  mathJaxLib: '//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_HTMLorMML',
  toolbar: [
    { name: 'document', items : [ 'Source' ] },
    { name: 'clipboard', items : [ 'Cut','Copy','Paste','PasteText','PasteFromWord','-','Undo','Redo' ] },
    { name: 'editing', items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
    { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','Subscript','Superscript','-','RemoveFormat' ] },
    '/',
    { name: 'styles', items : [ 'Styles','Format' ] },
    { name: 'insert', items : [ 'Image','Audio','oembed','Muikku-mathjax','Table','Iframe','SpecialChar', 'CreateDiv' ] },
    { name: 'links', items : [ 'Link','Unlink','Anchor' ] },
    { name: 'colors', items : [ 'TextColor','BGColor' ] },
    '/',
    { name: 'forms', items : ['MuikkuTextField', 'muikku-selection', 'MuikkuMemoField', 'muikku-filefield', 'muikku-audiofield', 'muikku-connectfield', 'muikku-organizerfield', 'muikku-sorterfield', 'muikku-mathexercisefield']},
    { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','BidiLtr','BidiRtl' ] },          
    { name: 'tools', items : [ 'Maximize', 'ShowBlocks','-','About'] }
  ],
  extraPlugins: "oembed,audio,divarea,image2,muikku-fields,muikku-textfield,muikku-memofield,muikku-filefield,muikku-audiofield,muikku-selection,muikku-connectfield,muikku-organizerfield,muikku-sorterfield,muikku-mathexercisefield,muikku-embedded,muikku-image-details,muikku-word-definition,muikku-audio-defaults,muikku-image-target,muikku-mathjax,autogrow,uploadimage",
  //extraPlugins: 'oembed,audio,image2,muikku-embedded,muikku-image-details,muikku-word-definition,muikku-audio-defaults,muikku-image-target,autogrow,uploadimage'
  //extraPlugins: 'widget,lineutils,filetools,notification,notificationaggregator,uploadwidget,uploadimage,divarea,image2,oembed,audio,muikku-embedded,muikku-image-details,muikku-word-definition,muikku-audio-defaults,muikku-image-target'
});

class MaterialEditor extends React.Component<MaterialEditorProps, MaterialEditorState> {
  private oldOverflow:string;

  constructor(props: MaterialEditorProps){
    super(props);
    
    this.state = {
      visible: false
    }

    this.beforeClose = this.beforeClose.bind(this);
    this.onOpen = this.onOpen.bind(this);
  }
  
  beforeClose(DOMNode: HTMLElement, removeFromDOM: ()=>any){
    this.setState({
      visible: false
    });
    this.props.setWorkspaceMaterialEditorState({...this.props.editorState, opened: false});
    setTimeout(removeFromDOM, 300);
  }
  
  onOpen() {
    setTimeout(()=>{
      this.setState({
        visible: true
      });
    }, 10);
  }

  render(){
    return (<Portal isOpen={this.props.editorState.opened}
        onOpen={this.onOpen} beforeClose={this.beforeClose} closeOnEsc>
        {(closePortal: ()=>any)=>{
          return <div
            className={`material-editor ${this.state.visible ? "material-editor--visible" : ""}`}
          >
            <div>
              <div>{this.props.i18n.text.get("TODO edit material")}</div>
              <ButtonPill onClick={closePortal} icon="close"/>
            </div>
            <div>
              <input type="text" value={this.props.editorState.currentNodeValue.title} readOnly></input>
            </div>
            {this.props.editorState.currentNodeValue.html ? <div>
              <CKEditor
                configuration={CKEditorConfig(
                  this.props.locale.current,
                  this.props.status.contextPath,
                  this.props.editorState.workspace,
                  this.props.editorState.currentNodeValue
                )}
                onChange={()=>null}
              >
                {this.props.editorState.currentNodeValue.html}
              </CKEditor>
            </div> : null}
          </div>
        }}
    </Portal>);
  }
}
  
function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    editorState: state.workspaces.materialEditor,
    status: state.status,
    locale: state.locales,
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return bindActionCreators({setWorkspaceMaterialEditorState}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MaterialEditor);