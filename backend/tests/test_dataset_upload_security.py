import io


def test_valid_csv_upload(client):
    csv_content = "feature1,feature2,target\n1.0,2.5,0\n2.0,3.5,1\n3.0,1.5,0\n4.0,5.0,1\n"
    file_tuple = ("clean_data.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 201
    data = response.json()
    assert "dataset_id" in data
    assert data["original_filename"] == "clean_data.csv"
    assert data["rows"] == 4
    assert data["columns"] == 3
    assert data["status"] == "uploaded"


def test_non_csv_extension_rejected(client):
    content = b"print('Hello world')"
    file_tuple = ("script.py", io.BytesIO(content), "text/x-python")
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "INVALID_FILE_TYPE"


def test_empty_file_rejected(client):
    file_tuple = ("empty.csv", io.BytesIO(b""), "text/csv")
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "EMPTY_FILE"


def test_zero_rows_header_only_csv_rejected(client):
    csv_content = "col1,col2,col3\n"
    file_tuple = ("header_only.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "EMPTY_DATASET"


def test_duplicate_column_names_rejected(client):
    csv_content = "age,salary,age\n25,50000,25\n30,60000,30\n"
    file_tuple = ("dup_cols.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 422
    data = response.json()
    assert data["error"]["code"] == "DUPLICATE_COLUMNS"


def test_path_traversal_sanitization(client):
    # Attacker tries ../../evil.csv
    csv_content = "x,y\n1,2\n3,4\n"
    file_tuple = (
        "../../../../etc/evil.csv",
        io.BytesIO(csv_content.encode("utf-8")),
        "text/csv",
    )
    response = client.post("/api/datasets/upload", files={"file": file_tuple})

    assert response.status_code == 201
    data = response.json()
    # Server must strip directory traversal and sanitize to basename
    assert "/" not in data["original_filename"]
    assert "\\" not in data["original_filename"]
    assert data["original_filename"] == "evil.csv"
