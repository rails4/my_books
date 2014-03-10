class CreateLoans < ActiveRecord::Migration
  def change
    create_table :loans do |t|
      t.string :lender
      t.date :returns
      t.references :book

      t.timestamps
    end
  end
end
