(function() {
  
  $.widget("custom.records", {
    options: {
      userEntityId: null
    },
    
    _create : function() {
      this._grades = $.parseJSON(this.element.attr('data-grades'));
      
      this.element.on('click', '.tr-item', $.proxy(this._onItemClick, this));
      this.element.on('click', '.tr-view-toolbar .icon-goback', $.proxy(this._loadWorkspaces, this));      
      this._loadWorkspaces();
    },
    
    _loadWorkspaces: function () {
      this._clear();
      mApi().workspace.workspaces
      .read({ userId: this.options.userEntityId })
      .on('$', $.proxy(function (workspaceEntity, callback) {
        mApi().workspace.workspaces.assessments
          .read(workspaceEntity.id, { userEntityId: this.options.userEntityId })
          .callback($.proxy(function (assessmentsErr, assessments) {
            if( assessmentsErr ){
              $('.notification-queue').notificationQueue('notification', 'error', assessmentsErr );
            } else {
              var assessment = assessments && assessments.length == 1 ? assessments[0] : null;
              if (assessment) {
                var grade = this._grades[[assessment.gradingScaleSchoolDataSource, assessment.gradingScaleIdentifier, assessment.gradeSchoolDataSource, assessment.gradeIdentifier].join('-')];
                workspaceEntity.evaluated = new Date(assessment.evaluated);
                workspaceEntity.verbalAssessment = assessment.verbalAssessment;
                workspaceEntity.grade = grade.grade;
                workspaceEntity.gradingScale = grade.scale;
              }
            }
            
            callback();
          }, this));
      }, this)) 
      .callback($.proxy(function (err, workspaces) {
        if( err ){
          $('.notification-queue').notificationQueue('notification', 'error', getLocaleText('plugin.records.errormessage.noworkspaces', err));
        } else {
          renderDustTemplate('/records/records_items.dust', workspaces, $.proxy(function(text) {
            this.element.append(text);
          }, this));
        }
      }, this));
    },
    
    _loadWorkspace: function (workspaceEntityId, grade, gradingScale, evaluated, verbalAssessment) {
      this._clear();
      
      mApi().workspace.workspaces.materials.read(workspaceEntityId, { assignmentType: 'EVALUATED' })
        .on('$', $.proxy(function (workspaceMaterial, callback) {
          // TODO: support for binary materials?
          
          mApi().materials.html.read(workspaceMaterial.materialId).callback($.proxy(function (htmlErr, htmlMaterial) {
            if (htmlErr) {
              $('.notification-queue').notificationQueue('notification', 'error', htmlErr);
            } else {
              mApi().workspace.workspaces.materials.evaluations.read(workspaceEntityId, workspaceMaterial.id, {
                userEntityId: this.options.userEntityId
              })
              .callback($.proxy(function (evaluationsErr, evaluations) {
                if (evaluationsErr) {
                  $('.notification-queue').notificationQueue('notification', 'error', evaluationsErr);
                } else { 
                  var evaluation = evaluations && evaluations.length == 1 ? evaluations[0] : null;
                  workspaceMaterial.material = htmlMaterial;
                  if (evaluation) {
                    var grade = this._grades[[evaluation.gradingScaleSchoolDataSource, evaluation.gradingScaleIdentifier, evaluation.gradeSchoolDataSource, evaluation.gradeIdentifier].join('-')];
                    workspaceMaterial.verbalAssessment = evaluation.verbalAssessment;
                    workspaceMaterial.grade = grade.grade;
                    workspaceMaterial.gradingScale = grade.scale;
                  }
                  
                  callback(); 
                }
              }, this));
            }
          }, this));   
        }, this))
        .callback($.proxy(function (err, assignments) {
          if (err) {
            $('.notification-queue').notificationQueue('notification', 'error', getLocaleText('plugin.records.errormessage.noworkspaces', err));
          } else {
            renderDustTemplate('/records/records_item_open.dust', { 
              assignments: assignments,
              workspaceGrade: grade, 
              workspaceGradingScale: gradingScale, 
              workspaceEvaluated: evaluated, 
              workspaceVerbalAssessment: verbalAssessment
            }, $.proxy(function(text) {
              this.element.append(text);
            }, this));
          }
        }, this));
    },
    _onItemClick: function (event) {
      var item = $(event.target).hasClass('tr-item') ? $(event.target) : $(event.target).closest('.tr-item');

      var workspaceEntityId = $(item).attr('data-workspace-entity-id');
      var verbalAssessment = $(item).attr('data-workspace-verbal-assessment');
      var grade = $(item).attr('data-workspace-grade');
      var gradingScale = $(item).attr('data-workspace-grading-scale');
      var evaluated = $(item).attr('data-workspace-evaluated');

      this._loadWorkspace(workspaceEntityId, grade, gradingScale, evaluated, verbalAssessment);
    },
    _clear: function(){
      this.element.empty();      
    },
    _destroy: function () {
      this.element.off('click', '.tr-item');
      this.element.off('click', '.tr-view-tool');
    }
  });
  
  $(document).ready(function(){
    $('.tr-records-view-container').records({
      userEntityId: MUIKKU_LOGGED_USER_ID
    });
  });
  
  
 /**

$(document).ready(function(){
	
    RecordsImpl = $.klass({

    	init : function(){
    		// todo: parse url
          this._loadWorkspaces();	
    	    $(RecordsImpl.recordsContainer).on("click", '.tr-item)', $.proxy(this.loadWorkspace,this));  

    	},

  


       _loadWorkspace : function(event){
      
          this.clearContainer();
          alert("loadWorkspace!");
            
//            if( err ){
//             $('.notification-queue').notificationQueue('notification', 'error', getLocaleText('plugin.tasktool.errormessage.notasks', err));
//            }else{        
//             renderDustTemplate('/records/record_item_open.dust', asreq, function(text) {
//               $(TaskImpl.taskContainer).append($.parseHTML(text));
//            
//             });
//            }
       
      },

  

      
    	_loadWorkspaces : function(){

            this.clearContainer();

              mApi().workspace.workspaces
                .read({ userId: MUIKKU_LOGGED_USER_ID })
                .callback( function (err, workspaces) {
                  if( err ){
                    $('.notification-queue').notificationQueue('notification', 'error', getLocaleText('plugin.records.errormessage.noworkspaces', err));
                  }else{                    
                    renderDustTemplate('/records/records_items.dust', workspaces, function(text) {
                      $(RecordsImpl.recordsContainer).append($.parseHTML(text));
                   
                    });
                  }
                });
      

    	},
    	  	


     clearContainer : function(){
       $(RecordsImpl.recordsContainer).empty();
     },      

	    _klass : {
	    	// Variables for the class
		  recordsContainer : ".tr-records-view-container"
	    }
    
    
    }); 
	

   window.records = new RecordsImpl();
  
        

	
	
}); **/

}).call(this);
