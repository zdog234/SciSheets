/*jslint unparam:true*/

YUI().use('datatable-mutable', 'panel', 'dd-plugin', function (Y) {

    // Create the datatable with some gadget information.
    "use strict";
    var idField    = Y.one('#productId'),
        nameField  = Y.one('#name'),
        priceField = Y.one('#price'),
        addRowBtn  = Y.one('#addRow'),

        cols = ['id', 'name', 'price'],
        data = [
            {id: 'ga-3475', name: 'gadget', price: '$6.99'},
            {id: 'sp-9980', name: 'sprocket', price: '$3.75'},
            {id: 'wi-0650', name: 'widget', price: '$4.25'}
        ],

        dt,
        panel,
        nestedPanel;

    // Define the addItem function - this will be called when 'Add Item' is
    // pressed on the modal form.
    function addItem() {
        dt.addRow({
            id   : idField.get('value'),
            name : nameField.get('value'),
            price: priceField.get('value')
        });

        idField.set('value', '');
        nameField.set('value', '');
        priceField.set('value', '');

        panel.hide();
    }

    // Define the removeItems function - this will be called when
    // 'Remove All Items' is pressed on the modal form and is confirmed 'yes'
    // by the nested panel.
    function removeItems() {
        dt.data.reset();
        panel.hide();
    }

    // Instantiate the nested panel if it doesn't exist, otherwise just show it.
    function removeAllItemsConfirm() {
        if (nestedPanel) {
            return nestedPanel.show();
        }

        nestedPanel = new Y.Panel({
            bodyContent: 'Are you sure you want to remove all items?',
            width      : 400,
            zIndex     : 6,
            centered   : true,
            modal      : true,
            render     : '#nestedPanel',
            buttons: [
                {
                    value  : 'Yes',
                    section: Y.WidgetStdMod.FOOTER,
                    action : function (e) {
                        e.preventDefault();
                        nestedPanel.hide();
                        panel.hide();
                        removeItems();
                    }
                },
                {
                    value  : 'No',
                    section: Y.WidgetStdMod.FOOTER,
                    action : function (e) {
                        e.preventDefault();
                        nestedPanel.hide();
                    }
                }
            ]
        });
    }

    // Create the DataTable.
    dt = new Y.DataTable({
        columns: cols,
        data   : data,
        summary: 'Price sheet for inventory parts',
        caption: 'Price sheet for inventory parts',
        render : '#dt'
    });

    // Create the main modal form.
    panel = new Y.Panel({
        srcNode      : '#panelContent',
        headerContent: 'Add A New Product',
        width        : 250,
        zIndex       : 5,
        centered     : true,
        modal        : true,
        visible      : false,
        render       : true,
        plugins      : [Y.Plugin.Drag]
    });

    panel.addButton({
        value  : 'Add Item',
        section: Y.WidgetStdMod.FOOTER,
        action : function (e) {
            e.preventDefault();
            addItem();
        }
    });

    panel.addButton({
        value  : 'Remove All Items',
        section: Y.WidgetStdMod.FOOTER,
        action : function (e) {
            e.preventDefault();
            removeAllItemsConfirm();
        }
    });

    // When the addRowBtn is pressed, show the modal form.
    addRowBtn.on('click', function (e) {
        panel.show();
    });

});
