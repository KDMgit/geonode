def transform(i_srs, o_srs, x, y):
    from pyproj import Proj
    from pyproj import transform
    
    p1 = Proj(init=i_srs)
    p2 = Proj(init=o_srs)
    
    x1, y1 = transform(p1, p2, x, y)
    
    if i_srs == 'EPSG:3004':
        x1, y1 = y1, x1
    
    return [x1, y1]

def transform_to_4326(i_srs, x, y):
    return transform(i_srs, "EPSG:4326", x, y)
