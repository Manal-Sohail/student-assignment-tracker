from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from database import get_db_connection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Assignment(BaseModel):
    title: str
    subject: str
    description: str
    due_date: str
    status: str = "Pending"


@app.get("/")
def home():
    return {"message": "Student Assignment Tracker API is running!"}
@app.get("/assignments")
def get_assignments():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM assignments")
    assignments = cursor.fetchall()
    cursor.close()
    db.close()
    return assignments
@app.get("/assignments/{assignment_id}")
def get_assignment(assignment_id: int):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM assignments WHERE ID = %s",
        (assignment_id,)
    )

    assignment = cursor.fetchone()

    cursor.close()
    db.close()

    if assignment is None:
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )

    return assignment
@app.post("/assignments")
def create_assignment(assignment: Assignment):
    db = get_db_connection()
    cursor = db.cursor()

    query = """
    INSERT INTO assignments
    (TITLE, SUBJECT, DESCRIPTION, DUE_DATE, STATUS)
    VALUES (%s, %s, %s, %s, %s)
    """

    values = (
        assignment.title,
        assignment.subject,
        assignment.description,
        assignment.due_date,
        assignment.status
    )

    cursor.execute(query, values)
    db.commit()

    cursor.close()
    db.close()

    return {"message": "Assignment created successfully!"}

@app.put("/assignments/{assignment_id}")
def update_assignment(assignment_id: int, assignment: Assignment):

    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute(
        "SELECT ID FROM assignments WHERE ID = %s",
        (assignment_id,)
    )

    existing_assignment = cursor.fetchone()

    if existing_assignment is None:
        cursor.close()
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )
    query = """
    UPDATE assignments
    SET TITLE = %s,
        SUBJECT = %s,
        DESCRIPTION = %s,
        DUE_DATE = %s,
        STATUS = %s
    WHERE ID = %s
    """

    values = (
        assignment.title,
        assignment.subject,
        assignment.description,
        assignment.due_date,
        assignment.status,
        assignment_id
    )
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    db.close()
    return {"message": "Assignment updated successfully!"}
@app.delete("/assignments/{assignment_id}")
def delete_assignment(assignment_id: int):

    db = get_db_connection()
    cursor = db.cursor()

    # Check if assignment exists
    cursor.execute(
        "SELECT ID FROM assignments WHERE ID = %s",
        (assignment_id,)
    )

    existing_assignment = cursor.fetchone()

    if existing_assignment is None:
        cursor.close()
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Assignment not found"
        )


    query = "DELETE FROM assignments WHERE ID = %s"

    cursor.execute(query, (assignment_id,))
    db.commit()

    cursor.close()
    db.close()

    return {"message": "Assignment deleted successfully!"}