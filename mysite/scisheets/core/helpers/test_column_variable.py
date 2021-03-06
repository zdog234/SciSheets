'''Tests for ColumnVariable.'''

from column_variable import ColumnVariable
from scisheets.core import helpers_test as ht
from scisheets.core.column import Column
from CommonUtil.is_null import isNull
import os
import unittest

FORMULA_COLUMN_NAME = "Formula_Column"


#############################
# Tests
#############################
# pylint: disable=W0212
# pylint: disable=C0111
# pylint: disable=R0904
class TestColumnVariable(unittest.TestCase):

  def setUp(self):
    self.table = ht.createTable("TEST",
        column_name=[ht.COLUMN1, ht.COLUMN2])
    new_column = Column(FORMULA_COLUMN_NAME)
    new_column.setFormula("np.sin(%s)" % ht.COLUMN1)
    self.table.addColumn(new_column)
    self.table.evaluate()
    columns = self.table.getColumns()
    self.column_variables =  \
        [ColumnVariable(c) for c in columns] 

  def testConstructor(self):
    for cv in self.column_variables:
      self.assertEqual(cv._baseline_value, cv._column.getCells())

  def testGetColumnValue(self):
    for cv in self.column_variables:
      self.assertEqual(cv.getColumnValue(), cv._column.getCells())

  def testGetNamespaceValue(self):
    def isNulls(array):
      return all([isNull(x) for x in array.tolist()])

    namespace = self.table.getNamespace()
    for cv in self.column_variables:
      if not ( isNulls(cv.getNamespaceValue()) and  \
               isNulls(namespace[cv._column.getName(is_global_name=False)])):
        if (cv.getNamespaceValue().tolist() != 
            namespace[cv._column.getName(is_global_name=False)].tolist()):
            import pdb; pdb.set_trace()
        self.assertTrue(cv.getNamespaceValue().tolist() == 
            namespace[cv._column.getName(is_global_name=False)].tolist())

  def testSetColumnValue(self):
    namespace = self.table.getNamespace()
    for cv in self.column_variables:
      num_rows = cv._column.numCells()
      new_value = [10*n for n in range(num_rows)]
      namespace[cv._column.getName(is_global_name=False)] = new_value
      cv.setColumnValue()
      self.assertEqual(cv.getColumnValue(), new_value)

  def testIsNamespaceValueEquivalentToBaselineValue(self):
    namespace = self.table.getNamespace()
    for cv in self.column_variables:
      self.assertTrue(cv.isNamespaceValueEquivalentToBaselineValue())
      num_rows = cv._column.numCells()
      new_value = [10*n for n in range(num_rows)]
      namespace[cv._column.getName(is_global_name=False)] = new_value
      cv.setIterationStartValue()
      self.assertFalse(cv.isNamespaceValueEquivalentToBaselineValue())
      cv.setColumnValue()
      cv._baseline_value = cv.getColumnValue()
      self.assertTrue(cv.isNamespaceValueEquivalentToBaselineValue())

  def testIsNamespaceValueEquivalentToIterationStartValue(self):
    namespace = self.table.getNamespace()
    for cv in self.column_variables:
      cv.setIterationStartValue()
      self.assertTrue(cv.isNamespaceValueEquivalentToIterationStartValue())
      num_rows = cv._column.numCells()
      new_value = [10*n for n in range(num_rows)]
      namespace[cv._column.getName(is_global_name=False)] = new_value
      self.assertFalse(cv.isNamespaceValueEquivalentToIterationStartValue())
      cv.setIterationStartValue()
      self.assertTrue(cv.isNamespaceValueEquivalentToIterationStartValue())

  def testCreateVariableForSubtable(self):
    colnm = "SubtableColumn"
    subtable = ht.createTable("Subtable", column_name=colnm)
    self.table.addChild(subtable)
    column = subtable.childFromName(colnm)
    cv = ColumnVariable(column)
    self.assertEqual(cv.getColumnValue(), column.getCells())
    

if  __name__ == '__main__':
  unittest.main()
