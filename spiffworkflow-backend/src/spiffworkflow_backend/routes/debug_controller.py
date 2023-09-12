"""APIs for dealing with process groups, process models, and process instances."""
from flask import make_response
from flask import request
from flask.wrappers import Response

from spiffworkflow_backend import get_version_info_data


def test_raise_error() -> Response:
    raise Exception("This exception was generated by /debug/test-raise-error for testing purposes. Please ignore.")


def version_info() -> Response:
    return make_response(get_version_info_data(), 200)


def url_info() -> Response:
    return make_response({"url": request.url}, 200)
