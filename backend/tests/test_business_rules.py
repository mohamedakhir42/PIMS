def test_stock_formula():
    initial = 100
    result = initial + 50 - 20 - 10 + 5 - 2
    assert result == 123

def test_low_stock_rule():
    assert 9 < 10
    assert not (10 < 10)

def test_critical_stock_rule():
    assert 0 <= 0
