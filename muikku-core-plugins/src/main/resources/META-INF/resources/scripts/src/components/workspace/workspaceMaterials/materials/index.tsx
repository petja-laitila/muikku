/* eslint-disable camelcase */
/* eslint-disable react/no-string-refs */

/**
 * Depcrecated refs should be refactored
 */

import * as React from "react";
import { StateType } from "~/reducers";
import { Dispatch, connect } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import {
  WorkspaceType,
  MaterialContentNodeListType,
  MaterialContentNodeType,
  MaterialCompositeRepliesListType,
  WorkspaceEditModeStateType,
  MaterialViewRestriction,
} from "~/reducers/workspaces";

import ContentPanel, {
  ContentPanelItem,
} from "~/components/general/content-panel";
import ProgressData from "../../progressData";

import WorkspaceMaterial from "./material";
import { ButtonPill } from "~/components/general/button";
import Dropdown from "~/components/general/dropdown";
import Link from "~/components/general/link";
import { bindActionCreators } from "redux";
import { Redirect } from "react-router-dom";
import { StatusType } from "~/reducers/base/status";
import { AnyActionType } from "~/actions";
import {
  materialShowOrHideExtraTools,
  MaterialShowOrHideExtraToolsTriggerType,
  setWorkspaceMaterialEditorState,
  createWorkspaceMaterialContentNode,
  updateWorkspaceMaterialContentNode,
  CreateWorkspaceMaterialContentNodeTriggerType,
  SetWorkspaceMaterialEditorStateTriggerType,
  UpdateWorkspaceMaterialContentNodeTriggerType,
} from "~/actions/workspaces/material";
import ReadSpeakerReader from "~/components/general/readspeaker";
import {
  displayNotification,
  DisplayNotificationTriggerType,
} from "~/actions/base/notifications";

/**
 * WorkspaceMaterialsProps
 */
interface WorkspaceMaterialsProps {
  i18n: i18nType;
  status: StatusType;
  workspace: WorkspaceType;
  materials: MaterialContentNodeListType;
  materialReplies: MaterialCompositeRepliesListType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: React.ReactElement<any>;
  activeNodeId: number;
  workspaceEditMode: WorkspaceEditModeStateType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onActiveNodeIdChange: (activeNodeId: number) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenNavigation: () => any;
  setWorkspaceMaterialEditorState: SetWorkspaceMaterialEditorStateTriggerType;
  createWorkspaceMaterialContentNode: CreateWorkspaceMaterialContentNodeTriggerType;
  updateWorkspaceMaterialContentNode: UpdateWorkspaceMaterialContentNodeTriggerType;
  materialShowOrHideExtraTools: MaterialShowOrHideExtraToolsTriggerType;
  displayNotification: DisplayNotificationTriggerType;
}

/**
 * WorkspaceMaterialsState
 */
interface WorkspaceMaterialsState {
  defaultOffset: number;
  redirect: string;
}

const DEFAULT_OFFSET = 67;

/**
 * WorkspaceMaterials
 */
class WorkspaceMaterials extends React.Component<
  WorkspaceMaterialsProps,
  WorkspaceMaterialsState
> {
  private flattenedMaterial: MaterialContentNodeListType;
  /**
   * constructor
   * @param props props
   */
  constructor(props: WorkspaceMaterialsProps) {
    super(props);

    this.state = {
      defaultOffset: DEFAULT_OFFSET,
      redirect: null,
    };

    this.onOpenNavigation = this.onOpenNavigation.bind(this);
    this.getFlattenedMaterials = this.getFlattenedMaterials.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.startupEditor = this.startupEditor.bind(this);
    this.createPage = this.createPage.bind(this);
    this.createSection = this.createSection.bind(this);
    this.pastePage = this.pastePage.bind(this);
    this.createPageFromBinary = this.createPageFromBinary.bind(this);
    this.toggleSectionHiddenStatus = this.toggleSectionHiddenStatus.bind(this);

    this.getFlattenedMaterials(props);
  }

  /**
   * componentDidMount
   */
  componentDidMount() {
    const defaultOffset =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((document.querySelector("#stick") as HTMLElement) || ({} as any))
        .offsetHeight || DEFAULT_OFFSET;
    if (defaultOffset !== this.state.defaultOffset) {
      this.setState({
        defaultOffset,
      });
    }

    window.addEventListener("scroll", this.onScroll);
  }

  /**
   * componentWillUnmount
   */
  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
  }

  /**
   * componentWillReceiveProps
   * @param nextProps nextProps
   */
  UNSAFE_componentWillReceiveProps(nextProps: WorkspaceMaterialsProps) {
    if (this.props.materials !== nextProps.materials) {
      this.getFlattenedMaterials(nextProps);
    }
  }

  /**
   * toggleSectionHiddenStatus
   * @param section section
   */
  toggleSectionHiddenStatus(section: MaterialContentNodeType) {
    this.props.updateWorkspaceMaterialContentNode({
      workspace: this.props.workspace,
      material: section,
      update: {
        hidden: !section.hidden,
      },
      isDraft: false,
    });
  }

  /**
   * getMaterialsOptionListDropdown
   * @param section section
   * @param nextSection nextSection
   * @param nextSibling nextSibling
   * @param includesSection includesSection
   */
  getMaterialsOptionListDropdown(
    section: MaterialContentNodeType,
    nextSection: MaterialContentNodeType,
    nextSibling: MaterialContentNodeType,
    includesSection: boolean
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialManagementItemsOptions: Array<any> = [
      {
        icon: "plus",
        text: "plugin.workspace.materialsManagement.createChapterTooltip",
        onClick: this.createSection.bind(this, nextSection),
        file: false,
      },
      {
        icon: "plus",
        text: "plugin.workspace.materialsManagement.createPageTooltip",
        onClick: this.createPage.bind(this, section, nextSibling),
        file: false,
      },
      {
        icon: "paste",
        text: "plugin.workspace.materialsManagement.pastePageTooltip",
        onClick: this.pastePage.bind(this, section, nextSibling),
        file: false,
      },
      {
        icon: "attachment",
        text: "plugin.workspace.materialsManagement.attachFileTooltip",
        onChange: this.createPageFromBinary.bind(this, section, nextSibling),
        file: true,
      },
    ];

    if (!includesSection) {
      materialManagementItemsOptions.shift();
    }

    return materialManagementItemsOptions;
  }

  /**
   * startupEditor
   * @param section section
   */
  startupEditor(section: MaterialContentNodeType) {
    this.props.setWorkspaceMaterialEditorState({
      currentNodeWorkspace: this.props.workspace,
      currentNodeValue: section,
      currentDraftNodeValue: { ...section },
      parentNodeValue: null,
      section: true,
      opened: true,
      canHide: true,
      canDelete: true,
      disablePlugins: false,
      canPublish: true,
      canRevert: true,
      canRestrictView: true,
      canCopy: false,
      canChangePageType: false,
      canChangeExerciseType: false,
      canSetLicense: false,
      canSetProducers: false,
      canAddAttachments: false,
      canEditContent: false,
      showRemoveAnswersDialogForPublish: false,
      showRemoveAnswersDialogForDelete: false,
      showUpdateLinkedMaterialsDialogForPublish: false,
      showRemoveLinkedAnswersDialogForPublish: false,
      showUpdateLinkedMaterialsDialogForPublishCount: 0,
      canSetTitle: true,
    });
  }

  /**
   * createPage
   * @param section section
   * @param nextSibling nextSibling
   */
  createPage(
    section: MaterialContentNodeType,
    nextSibling: MaterialContentNodeType
  ) {
    this.props.createWorkspaceMaterialContentNode(
      {
        workspace: this.props.workspace,
        rootParentId: this.props.workspace.details.rootFolderId,
        parentMaterial: section,
        nextSibling,
        title: this.props.i18n.text.get(
          "plugin.workspace.materialsManagement.newPageTitle"
        ),
        makeFolder: false,
      },
      "materials"
    );
  }

  /**
   * createPageFromBinary
   * @param section section
   * @param nextSibling nextSibling
   * @param e e
   */
  createPageFromBinary(
    section: MaterialContentNodeType,
    nextSibling: MaterialContentNodeType,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    this.props.createWorkspaceMaterialContentNode(
      {
        workspace: this.props.workspace,
        rootParentId: this.props.workspace.details.rootFolderId,
        parentMaterial: section,
        nextSibling,
        title: e.target.files[0].name,
        file: e.target.files[0],
        makeFolder: false,
      },
      "materials"
    );
  }

  /**
   * createSection
   * @param nextSibling nextSibling
   */
  createSection(nextSibling: MaterialContentNodeType) {
    this.props.createWorkspaceMaterialContentNode(
      {
        workspace: this.props.workspace,
        rootParentId: this.props.workspace.details.rootFolderId,
        nextSibling,
        title: this.props.i18n.text.get(
          "plugin.workspace.materialsManagement.newPageTitle"
        ),
        makeFolder: true,
      },
      "materials"
    );
  }

  /**
   * pastePage
   * @param section section
   * @param nextSibling nextSibling
   */
  pastePage(
    section: MaterialContentNodeType,
    nextSibling: MaterialContentNodeType
  ) {
    const workspaceMaterialCopiedId =
      localStorage.getItem("workspace-material-copied-id") || null;
    const workspaceCopiedId =
      localStorage.getItem("workspace-copied-id") || null;

    if (workspaceMaterialCopiedId) {
      this.props.createWorkspaceMaterialContentNode(
        {
          workspace: this.props.workspace,
          parentMaterial: section,
          rootParentId: this.props.workspace.details.rootFolderId,
          nextSibling,
          copyMaterialId: parseInt(workspaceMaterialCopiedId),
          copyWorkspaceId: parseInt(workspaceCopiedId),
          makeFolder: false,
        },
        "materials"
      );
    }
  }

  /**
   * getFlattenedMaterials
   * @param props props
   */
  getFlattenedMaterials(props: WorkspaceMaterialsProps = this.props) {
    this.flattenedMaterial = [];
    if (!props.materials) {
      return;
    }
    props.materials.forEach((node) => {
      node.children.forEach((subnode) => {
        this.flattenedMaterial.push(subnode);
      });
    });
  }

  /**
   * handleOpenMaterialExtraToolsDrawerClick
   */
  handleOpenMaterialExtraToolsDrawerClick = () => {
    this.props.materialShowOrHideExtraTools();
  };

  /**
   * onOpenNavigation
   */
  onOpenNavigation() {
    this.props.onOpenNavigation();
  }

  /**
   * onScroll
   */
  onScroll() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).IGNORE_SCROLL_EVENTS) {
      return;
    }
    const newActive: number = this.getActive();
    if (newActive !== this.props.activeNodeId) {
      this.props.onActiveNodeIdChange(newActive);
    }
  }

  /**
   * getActive
   */
  getActive() {
    //gets the current active node
    let winner: number = null;

    //when you are at the bottom the active is the last one
    const isAllTheWayToTheBottom =
      document.documentElement.scrollHeight -
        document.documentElement.scrollTop ===
      document.documentElement.clientHeight;

    if (!isAllTheWayToTheBottom) {
      let winnerTop: number = null;
      let winnerVisibleWeight: number = null;

      for (const refKey of Object.keys(this.refs)) {
        const refKeyInt = parseInt(refKey);
        if (!refKeyInt) {
          continue;
        }
        const element = (this.refs[refKey] as ContentPanelItem).getComponent();
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible =
          elementTop < window.innerHeight &&
          elementBottom >=
            (document.querySelector("#stick") as HTMLElement).offsetHeight;

        if (isVisible) {
          let cropBottom = window.innerHeight - elementBottom;

          if (cropBottom > 0) {
            cropBottom = 0;
          }

          let cropTop = elementTop;

          if (cropTop > 0) {
            cropTop = 0;
          }

          const cropTotal = -cropTop - cropBottom;

          const visibleFraction =
            (element.offsetHeight - cropTotal) / element.offsetHeight;
          let weight = visibleFraction;

          if (!winner || elementTop < winnerTop) {
            weight += 0.4;
          }

          if (!winnerVisibleWeight || weight >= winnerVisibleWeight) {
            winner = refKeyInt;
            winnerTop = elementTop;
            winnerVisibleWeight = weight;
          }
        }
      }
    } else {
      winner =
        this.flattenedMaterial[this.flattenedMaterial.length - 1]
          .workspaceMaterialId;
    }

    winner = winner || this.flattenedMaterial[0].workspaceMaterialId;
    return winner;
  }

  /**
   * buildViewRestrictionLocaleString
   * @param viewRestrict viewRestrict
   * @returns locale string
   */
  buildViewRestrictionLocaleString = (
    viewRestrict: MaterialViewRestriction
  ) => {
    switch (viewRestrict) {
      case MaterialViewRestriction.LOGGED_IN:
        return this.props.i18n.text.get(
          "plugin.workspace.materialViewRestricted"
        );

      case MaterialViewRestriction.WORKSPACE_MEMBERS:
        return this.props.i18n.text.get(
          "plugin.workspace.materialViewRestrictedToWorkspaceMembers"
        );

      default:
        return null;
    }
  };

  /**
   * render
   */
  render() {
    if (this.state.redirect) {
      return <Redirect push to={this.state.redirect} />;
    }

    if (!this.props.materials || !this.props.workspace) {
      return null;
    }

    const readSpeakerParameters: string[] = [];

    const isEditable = this.props.workspaceEditMode.active;

    const createSectionElementWhenEmpty =
      this.props.materials.length === 0 && isEditable ? (
        <div className="material-admin-panel material-admin-panel--master-functions">
          <Dropdown
            openByHover
            modifier="material-management-tooltip"
            content={this.props.i18n.text.get(
              "plugin.workspace.materialsManagement.createChapterTooltip"
            )}
          >
            <ButtonPill
              buttonModifiers="material-management-master"
              icon="plus"
              onClick={this.createSection.bind(this, null)}
            />
          </Dropdown>
        </div>
      ) : null;

    const emptyMessage =
      this.props.materials.length === 0 ? (
        <div className="material-page material-page--empty">
          {this.props.i18n.text.get(
            "plugin.workspace.materialsManagement.empty"
          )}
        </div>
      ) : null;

    // All material sections with pages and other possible elements
    const results: JSX.Element[] = [];

    this.props.materials.forEach((section, index) => {
      readSpeakerParameters.push(`sectionId${section.workspaceMaterialId}`);

      // If first section, then above it is "add new section" icon button
      // And it is only showed when editing is active
      if (index === 0 && isEditable) {
        results.push(
          <div
            key={"sectionfunctions-" + section.workspaceMaterialId}
            className="material-admin-panel material-admin-panel--master-functions"
          >
            <Dropdown
              openByHover
              modifier="material-management-tooltip"
              content={this.props.i18n.text.get(
                "plugin.workspace.materialsManagement.createChapterTooltip"
              )}
            >
              <ButtonPill
                buttonModifiers="material-management-master"
                icon="plus"
                onClick={this.createSection.bind(this, section)}
              />
            </Dropdown>
          </div>
        );
      }

      const nextSection = this.props.materials[index + 1] || null;

      // Management option, only showed when editing is active
      const lastManagementOptionsWithinSectionItem = isEditable ? (
        <div className="material-admin-panel material-admin-panel--master-functions">
          <Dropdown
            modifier="material-management"
            items={this.getMaterialsOptionListDropdown(
              section,
              nextSection,
              null,
              true
            ).map((item) => (closeDropdown: () => void) => {
              if (item.file) {
                return (
                  <label
                    htmlFor="baseFileInput"
                    className={`link link--full link--material-management-dropdown`}
                  >
                    <input
                      type="file"
                      id="baseFileInput"
                      onChange={(e) => {
                        closeDropdown();
                        item.onChange && item.onChange(e);
                      }}
                    />
                    <span className={`link__icon icon-${item.icon}`}></span>
                    <span>{this.props.i18n.text.get(item.text)}</span>
                  </label>
                );
              }
              return (
                <Link
                  className={`link link--full link--material-management-dropdown`}
                  onClick={() => {
                    closeDropdown();
                    item.onClick && item.onClick();
                  }}
                >
                  <span className={`link__icon icon-${item.icon}`}></span>
                  <span>{this.props.i18n.text.get(item.text)}</span>
                </Link>
              );
            })}
          >
            <ButtonPill
              buttonModifiers="material-management-master"
              icon="plus"
            />
          </Dropdown>
        </div>
      ) : null;

      // section is restricted in following cases:
      // section is restricted for logged in users and users is not logged in...
      // section is restricted for members only and user is not workspace member and isStudent or is not logged in...
      const isSectionViewRestricted =
        (section.viewRestrict === MaterialViewRestriction.LOGGED_IN &&
          !this.props.status.loggedIn) ||
        (section.viewRestrict === MaterialViewRestriction.WORKSPACE_MEMBERS &&
          !this.props.workspace.isCourseMember &&
          (this.props.status.isStudent || !this.props.status.loggedIn));

      // "section pages"
      const sectionSpecificContentData: JSX.Element[] = [];

      // If section is restricted we don't return anything
      !isSectionViewRestricted &&
        section.children.forEach((node, pageI) => {
          // this is the next sibling for the content node that is to be added, aka the current
          const nextSibling = node;

          // Adding editing functions to page if editing is active
          if (isEditable) {
            sectionSpecificContentData.push(
              <div
                key={node.workspaceMaterialId + "-dropdown"}
                className="material-admin-panel material-admin-panel--master-functions"
              >
                <Dropdown
                  modifier="material-management"
                  items={this.getMaterialsOptionListDropdown(
                    section,
                    nextSection,
                    nextSibling,
                    false
                  ).map((item) => (closeDropdown: () => void) => {
                    if (item.file) {
                      return (
                        <label
                          htmlFor={node.workspaceMaterialId + "-input"}
                          className={`link link--full link--material-management-dropdown`}
                        >
                          <input
                            type="file"
                            id={node.workspaceMaterialId + "-input"}
                            onChange={(e) => {
                              closeDropdown();
                              item.onChange && item.onChange(e);
                            }}
                          />
                          <span
                            className={`link__icon icon-${item.icon}`}
                          ></span>
                          <span>{this.props.i18n.text.get(item.text)}</span>
                        </label>
                      );
                    }
                    return (
                      <Link
                        className={`link link--full link--material-management-dropdown`}
                        onClick={() => {
                          closeDropdown();
                          item.onClick && item.onClick();
                        }}
                      >
                        <span className={`link__icon icon-${item.icon}`}></span>
                        <span>{this.props.i18n.text.get(item.text)}</span>
                      </Link>
                    );
                  })}
                >
                  <ButtonPill
                    buttonModifiers="material-management-master"
                    icon="plus"
                  />
                </Dropdown>
              </div>
            );
          }

          const compositeReplies =
            this.props.workspace &&
            this.props.materialReplies &&
            this.props.materialReplies.find(
              (reply) => reply.workspaceMaterialId === node.workspaceMaterialId
            );

          let showEvenIfHidden = false;

          // if student has submitted something before material has been set to hidden or
          // if student has answered something before material has been set to hidden then also
          // other states are also shown as they are part of evaluation
          // It will be still shown to student
          if (node.hidden && compositeReplies) {
            showEvenIfHidden =
              compositeReplies &&
              (compositeReplies.submitted !== null ||
                compositeReplies.state === "ANSWERED" ||
                compositeReplies.state === "SUBMITTED" ||
                compositeReplies.state === "WITHDRAWN" ||
                compositeReplies.state === "PASSED" ||
                compositeReplies.state === "FAILED" ||
                compositeReplies.state === "INCOMPLETE");
          }

          let readSpeakerComponent = undefined;

          if (!this.props.workspaceEditMode.active) {
            const arrayOfSectionsToRemoved = Array(
              pageI === 0 ? index : index + 1
            )
              .fill(0)
              .map((_, i) => i);

            const arrayOfPagesToRemoved = Array(pageI)
              .fill(0)
              .map((_, i) => i);

            let contentToRead = [
              ...this.props.materials
                .filter((section, i) => !arrayOfSectionsToRemoved.includes(i))
                .map((section) => `sectionId${section.workspaceMaterialId}`),
            ];

            if (pageI !== 0) {
              contentToRead = [
                ...section.children
                  .filter((page, i) => !arrayOfPagesToRemoved.includes(i))
                  .map((page) => `pageId${page.workspaceMaterialId}`),
                ...contentToRead,
              ];
            }

            readSpeakerComponent = (
              <ReadSpeakerReader
                entityId={pageI + 1}
                readParameterType="readid"
                readParameters={contentToRead}
              />
            );
          }

          // Actual page material
          // Nothing is shown is workspace or material "compositeReplies" are missing or
          // editing is not active and material is hided and showEvenIfHidden is false
          const material =
            !this.props.workspace ||
            !this.props.materialReplies ||
            (!isEditable && node.hidden && !showEvenIfHidden) ? null : (
              <ContentPanelItem
                id={`pageId${node.workspaceMaterialId}`}
                ref={node.workspaceMaterialId + ""}
                key={node.workspaceMaterialId + ""}
              >
                <div
                  id={"p-" + node.workspaceMaterialId}
                  style={{
                    transform:
                      "translateY(" + -this.state.defaultOffset + "px)",
                  }}
                />
                {/*TOP OF THE PAGE*/}
                <WorkspaceMaterial
                  folder={section}
                  materialContentNode={node}
                  workspace={this.props.workspace}
                  compositeReplies={compositeReplies}
                  isViewRestricted={false}
                  showEvenIfHidden={showEvenIfHidden}
                  readspeakerComponent={readSpeakerComponent}
                />
              </ContentPanelItem>
            );
          sectionSpecificContentData.push(material);
        });

      // Hidden materials are only shown if editing is active
      // Otherwise nothing is returned
      if (!isEditable && section.hidden) {
        return;
      }

      results.push(
        <section
          key={"section-" + section.workspaceMaterialId}
          className="content-panel__chapter"
          id={`sectionId${section.workspaceMaterialId}`}
        >
          <div
            id={"s-" + section.workspaceMaterialId}
            style={{
              transform: "translateY(" + -this.state.defaultOffset + "px)",
            }}
          />

          {/*TOP OF THE CHAPTER*/}
          <h2
            className={`content-panel__chapter-title ${
              section.hidden ? "state-HIDDEN" : ""
            }`}
          >
            {isEditable ? (
              <div className="material-admin-panel material-admin-panel--chapter-functions">
                <Dropdown
                  openByHover
                  modifier="material-management-tooltip"
                  content={this.props.i18n.text.get(
                    "plugin.workspace.materialsManagement.editChapterTooltip"
                  )}
                >
                  <ButtonPill
                    buttonModifiers="material-management-chapter"
                    icon="pencil"
                    onClick={this.startupEditor.bind(this, section)}
                  />
                </Dropdown>
                <Dropdown
                  openByHover
                  modifier="material-management-tooltip"
                  content={
                    section.hidden
                      ? this.props.i18n.text.get(
                          "plugin.workspace.materialsManagement.showChapterTooltip"
                        )
                      : this.props.i18n.text.get(
                          "plugin.workspace.materialsManagement.hideChapterTooltip"
                        )
                  }
                >
                  <ButtonPill
                    buttonModifiers="material-management-chapter"
                    icon="eye"
                    onClick={this.toggleSectionHiddenStatus.bind(this, section)}
                  />
                </Dropdown>
              </div>
            ) : null}
            <div
              className="content-panel__chapter-title-text"
              lang={section.titleLanguage || this.props.workspace.language}
            >
              {section.title}
            </div>
          </h2>

          {isSectionViewRestricted ? (
            <div className="content-panel__item">
              <article className="material-page">
                <div className="material-page__content material-page__content--view-restricted">
                  {this.buildViewRestrictionLocaleString(section.viewRestrict)}
                </div>
              </article>
            </div>
          ) : null}
          {sectionSpecificContentData}
          {lastManagementOptionsWithinSectionItem}
        </section>
      );
    });

    const progressData =
      this.props.workspace && this.props.workspace.activity ? (
        <ProgressData
          modifier="workspace-materials"
          title={this.props.i18n.text.get(
            "plugin.workspace.index.courseProgressLabel"
          )}
          i18n={this.props.i18n}
          activity={this.props.workspace.activity}
        />
      ) : null;

    return (
      <ContentPanel
        aside={progressData}
        onOpenNavigation={this.onOpenNavigation}
        modifier="workspace-materials"
        navigation={this.props.navigation}
        title={this.props.i18n.text.get("plugin.workspace.materials.pageTitle")}
        readspeakerComponent={
          <ReadSpeakerReader
            readParameterType="readid"
            readParameters={readSpeakerParameters}
          />
        }
        ref="content-panel"
      >
        {results}
        {emptyMessage}
        {createSectionElementWhenEmpty}
      </ContentPanel>
    );
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    status: state.status,
    workspace: state.workspaces.currentWorkspace,
    materials: state.workspaces.currentMaterials,
    materialReplies: state.workspaces.currentMaterialsReplies,
    activeNodeId: state.workspaces.currentMaterialsActiveNodeId,
    workspaceEditMode: state.workspaces.editMode,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    {
      setWorkspaceMaterialEditorState,
      createWorkspaceMaterialContentNode,
      updateWorkspaceMaterialContentNode,
      materialShowOrHideExtraTools,
      displayNotification,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  withRef: true,
})(WorkspaceMaterials);
