(function() {
  'use strict';
  
   $.widget("custom.muikkuConnectField", {
      options : {
        connector:[ "Bezier", { curviness: 25 } ],
        connectorStyle : {  lineWidth: 3, strokeStyle:"#5b9ada" },
        endpoint: ["Dot", {radius:7}]
      },
      _create : function() {
        this._element = $('<div>')
          .append($('<div>').addClass('muikku-connect-field-terms'))
          .append($('<div>').addClass('muikku-connect-field-gap'))
          .append($('<div>').addClass('muikku-connect-field-counterparts'))
          .muikkuField({
            materialId: this.options.materialId,
            embedId: this.options.embedId,
            fieldName: this.options.fieldName,
            answer: $.proxy(function () {
              return JSON.stringify(this.pairs());
            }, this)
          });
        
        this._taskInstance = jsPlumb.getInstance();
        
        this.element.find('.muikku-connect-field-term-cell').each($.proxy(function (index, term) {
          var fieldName = $(term).closest('tr').find('.muikku-connect-field-value').attr('name');
          
          var termElement = $('<div>')
            .addClass('muikku-connect-field-term')
            .attr('data-field-name', fieldName)
            .html($(term).html());
          this._element.find('.muikku-connect-field-terms').append(termElement);
        }, this));
        
        this.element.find('.muikku-connect-field-counterpart-cell').each($.proxy(function (index, counterpart) {
          var counterpartElement = $('<div>')
            .addClass('muikku-connect-field-counterpart')
            .attr('data-field-value', $(counterpart).data('muikku-connect-field-option-name'))
            .html($(counterpart).html());
          this._element.find('.muikku-connect-field-counterparts').append(counterpartElement);
        }, this));
        
        this.element
          .after(this._element)
          .hide();
        
        this._element.find('.muikku-connect-field-term').each($.proxy(function (index, element) {
          this._taskInstance.addEndpoint(
            $(element), {
              connector: this.options.connector,
              endpoint: this.options.endpoint,
              connectorStyle: this.options.connectorStyle,
              isSource: true,
              isTarget: false,
              maxConnections: 1,    
              anchor:"Right"
            }
          );
        }, this));

        this._element.find('.muikku-connect-field-counterpart').each($.proxy(function (index, element) {
          this._taskInstance.addEndpoint(
            $(element), {
              connector: this.options.connector,
              endpoint: this.options.endpoint,
              connectorStyle: this.options.connectorStyle,
              isSource: false,
              isTarget: true,
              maxConnections: 1,    
              anchor:"Left"
            }
          );
        }, this));

        this.element.find('.muikku-connect-field-value').each($.proxy(function (index, valueField) {
          var name = $(valueField).attr('name');
          var val = $(valueField).val();
          
          this._element.append($('<input>')
            .attr('type', 'hidden')
            .attr('name', name)
            .addClass('muikku-connect-field-input')
            .val(val)  
          );
          
          if (val) {
            var term = this._element.find('.muikku-connect-field-term[data-field-name="' + name + '"]');
            var counterpart = this._element.find('.muikku-connect-field-counterpart[data-field-value="' + val + '"]');
            
            this._taskInstance.connect({
              source: term, 
              target: counterpart,
              anchors: ["Right", "Left" ],
              endpoint: this.options.endpoint,
              connector: this.options.connector,
              paintStyle: this.options.connectorStyle
            });
          }

        }, this));
        
        this.element
          .addClass('muikku-connect-field')
          .hide();

        this._taskInstance.bind("connection", $.proxy(this._onConnection, this));
        this._taskInstance.bind("connectionDetached", $.proxy(this._onConnectionDetached, this));
        
        $(window).resize($.proxy(function () {
          this.refresh();
        }, this));
      },
      
      refresh: function () {
        this._taskInstance.repaintEverything();
      },
      
      pairs: function() {
        var pairs = {};
        
        $(this._element).find('.muikku-connect-field-input').each(function (index, input) {
          pairs[$(input).attr('name')] = $(input).val();
        });
        
        return pairs;
      },
      
      _onConnection: function (info) {
        this._element.find('input[name="' + $(info.source).data('field-name') + '"]').val($(info.target).data('field-value'));
      },
      
      _onConnectionDetached: function (info) {
        this._element.find('input[name="' + $(info.source).data('field-name') + '"]').val('');
      },
      
      _destroy : function() {
      }
    });
   
}).call(this);