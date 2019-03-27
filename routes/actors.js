const express = require('express');
const countries = require('../modules/countries');

const router = express.Router();

// Some information for queries
const table = 'actors';

// Some information for UI
const columns = ['#', 'name', 'middle_name', 'last_name', 'citizenship'];
const upCaseColumns = ['#', 'Name', 'Middle Name', 'Last Name', 'Citizenship'];

// Some information for routing
const changeRoute = 'change/actors';

// Some validation information
const nameMax = 50;

// Some validation messages
msgNameNotEmpty = "Name is required!";
msgNameMax = `Name must contain not more than ${nameMax} symbols!`;
msgNamePattern = 'Invalid name!';

msgMiddleNameMax = `Middle name must contain not more than ${nameMax} symbols!`;
msgMiddleNamePattern = 'Invalid middle name!';

msgLastNameNotEmpty = "Last name is required!";
msgLastNameMax = `Last name must contain not more than ${nameMax} symbols!`;
msgLastNamePattern = 'Invalid last name!';

router.post('/delete/:id', function(req, res) {
    const statusCode = deleteRow(table, `id = ${req.params.id}`)
    res.status(statusCode).redirect(`/${table}`);
});

var operation = null;
var id = 0;

router.post('/insert', urlencodedParser, function(req, res) {

  operation = opInsert;
  id = 0;

  res.status(OK).render(changeRoute, {database: upCaseDataBase,
      table: table, columns: columns, upCaseColumns: upCaseColumns,
      operation: operation, countries: countries, rows: null, errors: null});

});

router.post('/update/:id', urlencodedParser, function(req, res) {

  operation = opUpdate;
  id = req.params.id;

  const sql = `SELECT * FROM ${table} WHERE id = ${id};`;
  const query = db.query(sql, (err, rows) => {
      if (err) {
          res.status(INTERNAL_SERVER_ERROR).send(internalErrorMessage);
      }
      else {
          res.status(OK).render(changeRoute, {database: upCaseDataBase,
              table: table, columns: columns, upCaseColumns: upCaseColumns,
              operation: operation, countries: countries, rows: rows,
              errors: null});
      }
  });

});

function validateRequest(req) {

  req.check('name')
      .trim()
      .notEmpty().withMessage(msgNameNotEmpty)
      .isLength({ max: nameMax }).withMessage(msgNameMax)
      .matches(/^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?$/, 'i')
      .withMessage(msgNamePattern);

  req.check('middle_name')
      .trim()
      .isLength({ max: nameMax }).withMessage(msgMiddleNameMax)

  if (req.body.middle_name != '') {
      req.check('middle_name')
      .matches(/^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?$/, 'i')
      .withMessage(msgMiddleNamePattern);
  }

  req.check('last_name')
      .trim()
      .notEmpty().withMessage(msgLastNameNotEmpty)
      .isLength({ max: nameMax }).withMessage(msgLastNameMax)
      .matches(/^[A-Za-z]+('[A-Za-z]+)?(-|\s)?[A-Za-z]+('[A-Za-z]+)?(\,\s[A-Za-z]+\.)?$/, 'i')
      .withMessage(msgLastNamePattern);

  return req.validationErrors();

}

router.post('/save', urlencodedParser, function(req, res) {
    const errors = validateRequest(req);
    if (errors) {
        res.status(BAD_REQUEST).render(changeRoute, {
            database: upCaseDataBase, table: table,
            columns: columns, upCaseColumns: upCaseColumns,
            operation: operation, countries: countries, rows: null,
            errors: errors});
    }
    else {

        if (req.body.citizenship != 'NULL') {
            req.body.citizenship = `"${req.body.citizenship}"`;
        }

        const newValues = `name = "${req.body.name}
            ", middle_name = "${req.body.middle_name}", last_name = "
            ${req.body.last_name}", citizenship = ${req.body.citizenship}`;
        let statusCode = 0;
        if (operation == opInsert) {
            statusCode = insertRow(table, newValues);
        }
        else {
            statusCode = updateRow(table, newValues, `id = ${id}`);
        }

        res.status(statusCode).redirect('.');

    }
});

router.use('/', urlencodedParser, function(req, res) {
    const sql = `SELECT * FROM ${table} ORDER BY name, middle_name, last_name ASC;`;
    const query = db.query(sql, (err, rows) => {
        if (err) {
            res.status(INTERNAL_SERVER_ERROR).send(internalErrorMessage);
        }
        else {
            res.status(OK).render(tableRoute, {database: upCaseDataBase,
                table: table, columns: columns, upCaseColumns: upCaseColumns,
                rows: rows});
        }
    });
});

module.exports = router;