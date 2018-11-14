import * as React from "react";
import { StateType } from "~/reducers";
import { Dispatch, connect } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import { WorkspaceType, MaterialContentNodeListType, MaterialContentNodeType } from "~/reducers/workspaces";
import ProgressData from '../progressData';

import ApplicationPanel from '~/components/general/application-panel';
import MaterialLoader from "~/components/base/material-loader";
import { StatusType } from "~/reducers/base/status";

interface WorkspaceMaterialsProps {
  i18n: i18nType,
  workspace: WorkspaceType,
  materials: MaterialContentNodeListType,
  aside: React.ReactElement<any>,
  activeNodeId: number,
  status: StatusType
}

interface WorkspaceMaterialsState {
  loadedMaterialIds: {
    [key: number]: boolean
  }
}

function isScrolledIntoView(el: HTMLElement) {
  let rect = el.getBoundingClientRect();
  let elemTop = rect.top;
  let elemBottom = rect.bottom;

  let isVisible = elemTop < window.innerHeight && elemBottom >= 0;
  return isVisible;
}

class WorkspaceMaterials extends React.Component<WorkspaceMaterialsProps, WorkspaceMaterialsState> {
  private previousPassChanged: boolean;
  private flattenedMaterial: MaterialContentNodeListType;
  private indexedMaterial: {
    [id: string]: MaterialContentNodeType
  };
  constructor(props: WorkspaceMaterialsProps){
    super(props);
    
    this.state = {
      loadedMaterialIds: {}
    }
    
    this.recalculateLoaded = this.recalculateLoaded.bind(this);
    this.getFlattenedMaterials = this.getFlattenedMaterials.bind(this);
    this.onScroll = this.onScroll.bind(this);
    
    this.getFlattenedMaterials(props);
  }
  componentDidMount(){
    this.recalculateLoaded();
    window.document.addEventListener("scroll", this.onScroll);
  }
  componentWillUnmount(){
    window.document.removeEventListener("scroll", this.onScroll);
  }
  componentDidUpdate(){
    if (this.previousPassChanged){
      this.recalculateLoaded();
    }
  }
  onScroll(){
    this.recalculateLoaded();
  }
  componentWillReceiveProps(nextProps: WorkspaceMaterialsProps){
    if (this.props.activeNodeId !== nextProps.activeNodeId){
      this.recalculateLoaded(nextProps);
    }
    
    if (this.props.materials !== nextProps.materials){
      this.getFlattenedMaterials(nextProps);
    }
  }
  recalculateLoaded(props: WorkspaceMaterialsProps = this.props){
    this.previousPassChanged = false;
    if (!props.activeNodeId){
      return;
    }
    
    let newLoadedMaterialIds = {...this.state.loadedMaterialIds};
    let index = this.flattenedMaterial.findIndex((m)=>m.workspaceMaterialId === props.activeNodeId);
    
    newLoadedMaterialIds[props.activeNodeId] = true;
    
    Object.keys(this.refs).forEach((refKey: string)=>{
      if (isScrolledIntoView(this.refs[refKey] as HTMLElement)){
        newLoadedMaterialIds[parseInt(refKey)] = true;
      }
    });
    
    if (JSON.stringify(newLoadedMaterialIds) !== JSON.stringify(this.state.loadedMaterialIds)){
      this.previousPassChanged = true;
      this.setState({
        loadedMaterialIds: newLoadedMaterialIds
      });
    }
  }
  getFlattenedMaterials(props: WorkspaceMaterialsProps = this.props){
    this.flattenedMaterial = [];
    this.indexedMaterial = {};
    if (!this.props.materials){
      return;
    }
    this.props.materials.forEach((node)=>{
      node.children.forEach((subnode)=>{
        this.flattenedMaterial.push(subnode);
        this.indexedMaterial[subnode.workspaceMaterialId + ""] = subnode;
      });
    });
  }
  render(){
    if (!this.props.workspace || !this.props.materials){
      return null;
    }
    
    return <ApplicationPanel modifier="materials"
      toolbar={<div><h2>{this.props.workspace.name}</h2><ProgressData i18n={this.props.i18n}
      activity={this.props.workspace.studentActivity}/></div>}
      asideAfter={this.props.aside}>
        {this.props.materials.map((node)=>{
          return <section>
            <h1>{node.title}</h1>
            <div>
              {node.children.map((subnode)=>{
                if (this.state.loadedMaterialIds[subnode.workspaceMaterialId]){
                  return <MaterialLoader material={subnode} workspace={this.props.workspace}
                    i18n={this.props.i18n} status={this.props.status}/>
                }
                return <div style={{height: 600}} ref={subnode.workspaceMaterialId + ""}>{subnode.workspaceMaterialId}</div>
              })}
            </div>
          </section>
          })
        }
    </ApplicationPanel>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    workspace: state.workspaces.currentWorkspace,
    materials: state.workspaces.currentMaterials,
    activeNodeId: state.workspaces.currentMaterialsActiveNodeId,
    status: state.status
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WorkspaceMaterials);