'''The file handles the logic of the views'''

from django.http import HttpResponse
from ..core.errors import InternalError
from ..ui.dt_table import DTTable
import mysite.helpers.util as ut
import mysite.settings as st
import json
import os
import pickle
import tempfile

TABLE_FILE_KEY = "pickle_file"
USE_LOCAL_FILE = True
LOCAL_FILE = "scisheet_table"


# ******************** Helper Functions *****************
def extractDataFromRequest(request, key, convert=False, listvar=False):
  """
  Returns the value of the key
  """
  if request.GET.has_key(key):
    if listvar:
      return request.GET.getlist(key)
    elif convert:
      return ut.ConvertType(request.GET.get(key))
    else:
      return request.GET.get(key)
  else:
    return None

def createCommandDict(request):
  """
  Creates a dictionary from the fields in the request
  that constitute the JSON structure sent in the command
  from AJAX.
  Input: request - HTML request object
  Output: cmd_dict - dictionary of the command
   TARGET  COMMAND   DESCRIPTION
    Table   Export   Export the table into python
    Table   FileOpen Change the current Table file to
                     what is specified in the args list
    Table   ListTableFiles Returns a list of the table files
    Table   Open     Changes the current Table to that with the
                     specified name (without extension)
    Table   Rename   Change the table name. Must be a valid python name
    Table   Trim     Remove None rows from the end of the table
    Cell    Update   Update the specified cell
    Column  Append   Add a new column to the right of the current
    Column  Insert   Add a new column to the left of the current
    Column  Delete   Delete the column
    Column  Formula  Change the column's formula
    Column  Move     Move the column to another position
                       The name LAST is used for last column
    Column  Rename   Rename the column
    Row     Append   Add a new row after the current row
    Row     Insert   Add a new row before the current row
    Row     Move     Move the row to the specified position
  """
  cmd_dict = {}
  cmd_dict['command'] = extractDataFromRequest(request, 'command')
  cmd_dict['target'] = extractDataFromRequest(request, 'target')
  cmd_dict['table_name'] = extractDataFromRequest(request, 'table')
  cmd_dict['args'] = extractDataFromRequest(request, 'args[]', listvar=True)
  cmd_dict['column_index'] = extractDataFromRequest(request,
      'column', convert=True)
  row_name = extractDataFromRequest(request, 'row')
  if row_name is not None and len(str(row_name)) > 0:
    cmd_dict['row_index'] = DTTable.rowIndexFromName(row_name)
  else:
    cmd_dict['row_index'] = None  # Handles case where "row" is absent
  cmd_dict['value'] = extractDataFromRequest(request, 'value',
      convert=True)
  if cmd_dict['row_index'] == -1:
    raise InternalError("Invalid row_index: %d" % cmd_dict['row_index'])
  return cmd_dict

def _getTable(table_file):
  """
  Get the table from the file
  """
  fh = open(table_file, "rb")
  return pickle.load(fh)


def _setTableFile(request, file_name):
  """
  Sets the file path in the session key
  Input: request - request for the session
         file_name - name of file without extension
  """
  table_file = "%s.pcl" % file_name
  table_file_path = os.path.join(st.SCISHEETS_USER_TBLDIR, table_file)
  if not os.path.isfile(table_file_path):
    raise InternalError("Could not find Table file %s"
        % table_file_path)
  request.session[TABLE_FILE_KEY] = table_file_path

def _getTableFile(request):
  """
  Sets the file path in the session key
  Input: request - request for the session
  Output: file path or None if not found
  """
  if TABLE_FILE_KEY in request.session:
    return request.session[TABLE_FILE_KEY]
  else:
    return None

def unPickleTable(request):
  """
 Returns the table if found
  """
  table_file = _getTableFile(request)
  if table_file is None:
    return None
  else:
    return _getTable(table_file)

def pickleTable(request, table):
  """
  Serialize the table into its file
  """
  if USE_LOCAL_FILE:
    _setTableFile(request, LOCAL_FILE)
  else:
    handle = tempfile.NamedTemporaryFile()
    request.session[TABLE_FILE_KEY] = handle.name  # Just get the name
    handle.close()
  pickle.dump(table, open(request.session[TABLE_FILE_KEY], "wb"))


# ******************** Command Processing *****************
def scisheets(request, ncol, nrow):
  """
  Creates a new table with the specified number of columns and rows
  considering the number of rows with strings
  """
  ncol = int(ncol)
  nrow = int(nrow)
  ncolstr = int(ncol/2)
  table = DTTable.createRandomTable("Demo", nrow, ncol,
      ncolstr=ncolstr)
  html = table.render()
  pickleTable(request, table)
  return HttpResponse(html)

def scisheets_command0(request):
  """
  Invoked from Ajax within the page with a command structure
  Input: request - includes command structure in the GET
  Output returned - HTTP response
  """
  cmd_dict = createCommandDict(request)
  command_result = _processUserEnvrionmentCommand(request, cmd_dict)
  if command_result is None:
    # Use table processing command
    table = unPickleTable(request)
    command_result = table.processCommand(cmd_dict)
    pickleTable(request, table)  # Save table modifications
  json_str = json.dumps(command_result)
  return HttpResponse(json_str, content_type="application/json")

def _processUserEnvrionmentCommand(request, cmd_dict):
  """
  Processes commands that relate to the environment in which
  the user is executing.
  Input: request - includes command structure in the GET
         cmd_dict - command informat extracted from the request
  Outputs: command_result - JSON structure returned to the user
                      None if the command is not a user environment command
  """
  command_result = None
  target = cmd_dict["target"]
  if target == 'Table':
    if cmd_dict['command'] == "ListTableFiles":
      command_result = _listTableFiles()
    if cmd_dict['command'] == "OpenTableFile":
      _setTableFile(request, cmd_dict['args'][0])
      command_result = {'data': "OK", 'success': True}
  return command_result

# TODO: Tests
def _listTableFiles():
  """
  Output: returns response that contains the list of table files in data
  """
  lensfx = len(".pcl")
  file_list = [ff[:-lensfx] for ff in os.listdir(st.SCISHEETS_USER_TBLDIR)
               if ff[-lensfx:] == '.pcl']
  return {'data': file_list, 'success': True}

def scisheets_reload(request):
  """
  Invoked to reload the current page
  """
  table = unPickleTable(request)
  if table is None:
    html = "No session found"
  else:
    table.evaluate()
    html = table.render()
  return HttpResponse(html)
