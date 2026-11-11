import io


def test_dataset_profiling_and_configuration(client):
    csv_content = (
        "age,salary,department,left_company\n"
        "25,50000,Sales,No\n"
        "30,65000,Engineering,No\n"
        "45,120000,Engineering,Yes\n"
        "35,70000,HR,No\n"
        "50,140000,Sales,Yes\n"
        "28,52000,Sales,No\n"
        "42,95000,Engineering,Yes\n"
    )
    file_tuple = ("employees.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    upload_res = client.post("/api/datasets/upload", files={"file": file_tuple})
    assert upload_res.status_code == 201
    dataset_id = upload_res.json()["dataset_id"]

    profile_res = client.get(f"/api/datasets/{dataset_id}/profile")
    assert profile_res.status_code == 200
    pdata = profile_res.json()
    assert pdata["row_count"] == 7
    assert pdata["column_count"] == 4
    assert len(pdata["column_profiles"]) == 4

    col_names = [cp["name"] for cp in pdata["column_profiles"]]
    assert "age" in col_names
    assert "salary" in col_names
    assert "department" in col_names
    assert "left_company" in col_names

    salary_profile = next(cp for cp in pdata["column_profiles"] if cp["name"] == "salary")
    assert salary_profile["inferred_type"] == "numeric"
    assert salary_profile["min"] == 50000
    assert salary_profile["max"] == 140000
    assert salary_profile["mean"] > 50000

    config_res = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "left_company"},
    )
    assert config_res.status_code == 200
    cdata = config_res.json()
    assert cdata["target_column"] == "left_company"
    assert cdata["task_type"] == "classification"
    assert "logistic_regression" in cdata["compatible_models"]
    assert "random_forest_classifier" in cdata["compatible_models"]


def test_invalid_target_column_rejected(client):
    csv_content = "a,b,c\n1,2,3\n4,5,6\n"
    file_tuple = ("data.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    upload_res = client.post("/api/datasets/upload", files={"file": file_tuple})
    dataset_id = upload_res.json()["dataset_id"]

    bad_config = client.post(
        f"/api/datasets/{dataset_id}/configure",
        json={"target_column": "target_does_not_exist"},
    )
    assert bad_config.status_code == 400
    assert bad_config.json()["error"]["code"] == "INVALID_TARGET_COLUMN"
