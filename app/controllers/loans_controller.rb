class LoansController < ApplicationController

  def create
    @book = Book.find(params[:book_id])
    @loan = @book.loans.create(loan_params)
    redirect_to book_path(@book)
  end

  def destroy
    @book = Book.find(params[:book_id])
    @loan = @book.loans.find(params[:id])
    @loan.destroy
    redirect_to book_path(@book)
  end

  private

  def loan_params
    params.require(:loan).permit(:lender, :returns)
  end

end
