
const reservationsService = require("./reservations.service.js");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const hasRequiredProperties = hasProperties("first_name", "last_name", "mobile_number", "reservation_date", "reservation_time", "people");

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function validDate(req, res, next) {
  const date = new Date(req.body.data.reservation_date.replace("-", "/"));
  // testing if date is a date, date is not a tuesday, date is not in the past
  const today = new Date();
  if (date.getDate() < today.getDate()) {
    return next({
      status: 400,
      message: `Invalid field(s): reservation_date`,
    });
  }
  if (date instanceof Date && !isNaN(date) && date.getDay() != 2) {
    next();
  } else {
    return next({
      status: 400,
      message: `Invalid field(s): reservation_date`,
    });
  }
}

// function validTime(req, res, next) {
//   const time = req.body.data.reservation_time;
//   const timeFormat = /\d\d:\d\d/;
//   if (timeFormat.test(time)) {
//     next();
//   }
//   return next({
//     status: 400,
//     message: `Invalid field(s): reservation_time`,
//   });
//   next();
// }


function hasPeople(req, res, next) {
  if (isNaN(req.body.data.people)) {
    next({status: 400, message: `Invalid field(s): people`})
  }
  const people = Number(req.body.data.people)
  if (people >= 1) {
     return next()
  } else {
    next({status: 400, message: `Invalid field(s): people`})
  }
}


async function create(req, res) {
  const newReservation = await reservationsService.create(req.body.data);
  res.status(201).json({
    data: newReservation,
  });
}

async function list(req, res) {
  const reservationDate = req.query.date;
  const data = await reservationsService.list(reservationDate);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [hasOnlyValidProperties, hasRequiredProperties, hasPeople, validDate, asyncErrorBoundary(create)],
};
