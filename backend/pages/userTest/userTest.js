var ERR = require('async-stacktrace');
var _ = require('lodash');
var path = require('path');
var csvStringify = require('csv').stringify;
var express = require('express');
var router = express.Router();

var assessment = require('../../assessment');
var logger = require('../../logger');
var sqldb = require('../../sqldb');
var sqlLoader = require('../../sql-loader');

var sql = sqlLoader.load(path.join(__dirname, 'userTest.sql'));

function makeTestInstance_OLD_UNUSED_SAVE_FIXME(req, res, next) {
    assessment.makeQuestionInstances(res.locals.test, res.locals.course, function(err, questionInstances) {
        if (ERR(err, next)) return;

        sqldb.getClient(function(err, client, done) {
            if (ERR(err, next)) return;

            sqldb.queryWithClient(client, done, 'START TRANSACTION', [], function(err, result) {
                if (ERR(err, next)) return;

                var params = {
                    test_id: res.locals.test.id,
                    user_id: res.locals.user.id,
                };
                sqldb.queryWithClient(client, done, sql.new_test_instance, params, function(err, result) {
                    if (ERR(err, next)) return;
                    if (result.rowCount !== 1) {
                        done();
                        return next(new Error("new_test_instance did not return exactly 1 row"));
                    }
                    res.locals.testInstance = result.rows[0];

                    async.eachSeries(questionInstances, function(questionInstance, callback) {
                        var params = {
                            test_instance_id: res.locals.testInstance.id,
                            user_id: res.locals.user.id,
                            test_question_id: questionInstance.test_question_id,
                            number: questionInstance.number,
                            variant_seed: questionInstance.variant_seed,
                            params: questionInstance.params,
                            true_answer: questionInstance.true_answer,
                            options: questionInstance.options,
                        };
                        sqldb.queryWithClient(client, done, sql.new_question_instance, params, callback);
                    }, function(err) {
                        if (ERR(err, next)) return;
                        
                        sqldb.queryWithClient(client, done, 'COMMIT', [], function(err, result) {
                            if (ERR(err, next)) return;
                            sqldb.releaseClient(client, done);
                            res.redirect(res.locals.urlPrefix + '/testInstance/' + result.rows[0].test_instance_id);
                        });
                    });
                });
            });
        });
    });
}

function makeTestInstance(req, res, next) {
    var params = {
        test_id: res.locals.test.id,
        user_id: res.locals.user.id,
    };
    sqldb.query(sql.new_test_instance, params, function(err, result) {
        if (ERR(err, next)) return;
        if (result.rowCount !== 1) {
            done();
            return next(new Error("new_test_instance did not return exactly 1 row"));
        }
        res.locals.testInstance = result.rows[0];
        assessment.newTestInstance(res.locals.testInstance, res.locals.test, res.locals.course, function(err) {
            if (ERR(err, next)) return;
            res.redirect(res.locals.urlPrefix + '/testInstance/' + res.locals.testInstance.id);
        });
    });
};

router.get('/', function(req, res, next) {
    if (res.locals.test.multiple_instance) {
        makeTestInstance(req, res, next);
    } else {
        var params = {test_id: res.locals.test.id, user_id: res.locals.user.id};
        sqldb.query(sql.find_single_test_instance, params, function(err, result) {
            if (ERR(err, next)) return;
            if (result.rowCount == 0) {
                makeTestInstance(req, res, next);
            } else {
                res.redirect(res.locals.urlPrefix + '/testInstance/' + result.rows[0].test_instance_id);
            }
        });
    }
});

module.exports = router;