"""Validation for the gripper ArUco print sheet."""

import asyncio

import pytest
from fastapi import HTTPException

from server import print_gripper_markers_page


def test_gripper_print_sheet_defaults_to_ids_2_and_3_at_22mm():
    html = asyncio.run(print_gripper_markers_page())

    assert 'marker_id=2&size=400' in html
    assert 'marker_id=3&size=400' in html
    assert 'width: 22mm;' in html
    assert 'height: 22mm;' in html
    assert 'border: 0;' in html
    assert 'PRINT 22MM GRIPPER MARKERS' in html
    assert 'left: 22.7%' in html
    assert 'left: 45.5%' in html
    assert 'left: 68.2%' in html


def test_gripper_print_ruler_tracks_custom_marker_size():
    html = asyncio.run(print_gripper_markers_page(size_mm=20.0))

    assert 'width: 20mm;' in html
    assert 'height: 20mm;' in html
    assert 'left: 25.0%' in html
    assert 'left: 50.0%' in html
    assert 'left: 75.0%' in html


def test_gripper_print_rejects_nonpositive_size():
    with pytest.raises(HTTPException, match="positive finite") as exc_info:
        asyncio.run(print_gripper_markers_page(size_mm=0))
    assert exc_info.value.status_code == 400
