(function() {

  $.widget("custom.notificationQueue", {
    options : {
      'hide': {
        'effect': 'blind',
        'options': {
          'duration': 1000,
          'easing': 'easeOutBounce'
        }
      },
      'severity-info': {
        'class': 'notification-queue-item-info',
        'timeout': 30000
      },
      'severity-warn': {
        'class': 'notification-queue-item-warn'
      },
      'severity-error': {
        'class': 'notification-queue-item-error'
      },
      'severity-fatal': {
        'class': 'notification-queue-item-fatal'
      },
      'severity-success': {
        'class': 'notification-queue-item-success',
        'timeout': 30000
      },
      'severity-loading': {
        'class': 'notification-queue-item-loading'
      }
    },
    
    _create: function () {
      $('.notification-queue-item').each($.proxy(function (index, item) {
        this._setupItem(item);
      }, this));
    },
    
    notification: function (severity, message) {
      var severityOption = this.options['severity-' + severity];
      if (severityOption) {
        this._setupItem($('<div>')
          .data('severity', severity)
          .addClass('notification-queue-item')
          .addClass(severityOption['class'])
          .append($('<span>').html(message))
          .append($('<a>').attr('href', 'javascript:void(null)'))
          .appendTo($(this.element).find('.notification-queue-items')));
      } else {
        throw new Error("Severity " + severity + " is undefined");
      }
    },
    
    _setupItem: function (item) {
      var severityOption = this.options['severity-' + $(item).data('severity')];
      if (severityOption && severityOption.timeout) {
        setTimeout($.proxy(function () {
          $(item).hide(this.options.hide.effect, this.options.hide.options);
        }, this), severityOption.timeout);
      } 
      
      $(item).find('a').click($.proxy(this._onRemoveClick, this));
    },
    
    _onRemoveClick: function (event, data) {
      $(event.target).closest('.notification-queue-item').hide(this.options.hide.effect, this.options.hide.options);
    },
    
    _destroy : function() {
      
    }
  });
  
  $(document).ready(function() {
    $('.notification-queue').notificationQueue();
  });
  
}).call(this);