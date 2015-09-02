YUI({ filter: 'raw' }).use( "datatable-sort", "datatable-scroll", "cssbutton", function (Y) {

    var ports = [
        { port:20,  pname:'FTP_data',ptitle:'File Transfer Process Data' },
        { port:21,  pname:'FTP',     ptitle:'File Transfer Process' },
        { port:22,  pname:'SSH',     ptitle:'Secure Shell' },
        { port:23,  pname:'TELNET',  ptitle:'Telnet remote communications' },
        { port:25,  pname:'SMTP',    ptitle:'Simple Mail Transfer Protocol' },
        { port:43,  pname:'WHOIS',   ptitle:'whois Identification' },
        { port:53,  pname:'DNS',     ptitle:'Domain Name Service' },
        { port:68,  pname:'DHCP',    ptitle:'Dynamic Host Control Protocol' },
        { port:79,  pname:'FINGER',  ptitle:'Finger Identification' },
        { port:80,  pname:'HTTP',    ptitle:'HyperText Transfer Protocol' },
        { port:110, pname:'POP3',   ptitle:'Post Office Protocol v3' },
        { port:115, pname:'SFTP',   ptitle:'Secure File Transfer Protocol' },
        { port:119, pname:'NNTP',   ptitle:'Network New Transfer Protocol' },
        { port:123, pname:'NTP',    ptitle:'Network Time Protocol' },
        { port:139, pname:'NetBIOS',ptitle:'NetBIOS Communication' },
        { port:143, pname:'IMAP',   ptitle:'Internet Message Access Protocol' },
        { port:161, pname:'SNMP',   ptitle:'Simple Network Management Protocol' },
        { port:194, pname:'IRC',    ptitle:'Internet Relay Chat' },
        { port:220, pname:'IMAP3',  ptitle:'Internet Message Access Protocol v3' },
        { port:389, pname:'LDAP',   ptitle:'Lightweight Directory Access Protocol' },
        { port:443, pname:'SSL',    ptitle:'Secure Socket Layer' },
        { port:445, pname:'SMB',    ptitle:'NetBIOS over TCP' },
        { port:993, pname:'SIMAP',  ptitle:'Secure IMAP Mail' },
        { port:995, pname:'SPOP',   ptitle:'Secure POP Mail' }
    ];

    var table = new Y.DataTable({
        columns : [
            {   key:        'select',
                allowHTML:  true, // to avoid HTML escaping
                label:      '<input type="checkbox" class="protocol-select-all" title="Toggle ALL records"/>',
                formatter: '<input type="checkbox" checked/>',
                emptyCellValue: '<input type="checkbox"/>'
            },
            {   key: 'port',   label: 'Port No.' },
            {   key: 'pname',  label: 'Protocol' },
            {   key: 'ptitle', label: 'Common Name' }
        ],
        data      : ports,
        scrollable: 'y',
        height    : '250px',
        sortable  : ['port','pname'],
        sortBy    : 'port',
        recordType: ['select', 'port', 'pname', 'ptitle']
    }).render("#dtable");

    // To avoid checkbox click causing harmless error in sorting
    // Workaround for bug #2532244
    table.detach('*:change');

    //----------------
    //   "checkbox" Click listeners ...
    //----------------

    // Define a listener on the DT first column for each record's "checkbox",
    //   to set the value of <code>select</code> to the checkbox setting
    table.delegate("click", function(e){
        // undefined to trigger the emptyCellValue
        var checked = e.target.get('checked') || undefined;

        // Don't pass <code>{silent:true}</code> if there are other objects in your app
        // that need to be notified of the checkbox change.
        this.getRecord(e.target).set('select', checked, { silent: true });

        // Uncheck the header checkbox
        this.get('contentBox')
            .one('.protocol-select-all').set('checked', false);
    }, ".yui3-datatable-data .yui3-datatable-col-select input", table);


    // Also define a listener on the single TH "checkbox" to
    //   toggle all of the checkboxes
    table.delegate('click', function (e) {
        // undefined to trigger the emptyCellValue
        var checked = e.target.get('checked') || undefined;

        // Set the selected attribute in all records in the ModelList silently
        // to avoid each update triggering a table update
        this.data.invoke('set', 'select', checked, { silent: true });

        // Update the table now that all records have been updated
        this.syncUI();
    }, '.protocol-select-all', table);

    //----------------
    //  CSS-Button click handlers ....
    //----------------
    function process() {
        var ml  = table.data,
            msg = '',
            template = '<li>Record index = {index} Data = {port} : {pname}</li>';

        ml.each(function (item, i) {
            var data = item.getAttrs(['select', 'port', 'pname']);

            if (data.select) {
                data.index = i;
                msg += Y.Lang.sub(template, data);
            }
        });

        Y.one("#processed").setHTML(msg || '<li>(None)</li>');
    }

    Y.one("#btnSelected").on("click", process);

    Y.one("#btnClearSelected").on("click",function () {
        table.data.invoke('set', 'select', undefined);

        // Uncheck the header checkbox
        table.get('contentBox')
            .one('.protocol-select-all').set('checked', false);

        process();
    });

});
